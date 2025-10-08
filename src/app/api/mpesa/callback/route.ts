/**
 * M-Pesa Callback Handler
 * Receives payment confirmations from Safaricom and updates user permissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import type { TransactionType } from '@/types';
import { rateLimiter, RATE_LIMITS } from '@/lib/security/rate-limiter';
import { getClientIP } from '@/lib/security/api-security';
import { logPaymentAttempt } from '@/lib/security/audit-logger';
import { logPaymentError } from '@/lib/error-logger';

// Initialize Firebase for server-side operations
const app = initializeApp(firebaseConfig, 'mpesa-callback');
const db = getFirestore(app);

// Log callback for debugging
async function logCallback(data: any) {
  try {
    await addDoc(collection(db, 'mpesa_callbacks'), {
      data,
      receivedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to log callback:', error);
  }
}

// Update user permissions based on transaction type
async function updateUserPermissions(
  userId: string,
  type: TransactionType,
  amount: number,
  listingId?: string
) {
  try {
    const userRef = doc(db, 'users', userId);

    switch (type) {
      case 'CONTACT_ACCESS':
        // Grant 30-day contact access
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await updateDoc(userRef, {
          canViewContacts: true,
          contactAccessExpiresAt: Timestamp.fromDate(expiresAt),
          lastContactPaymentDate: serverTimestamp(),
          totalContactPayments: (amount || 0),
          lastTransactionDate: serverTimestamp(),
        });
        break;

      case 'FEATURED_LISTING':
        if (!listingId) {
          console.error('No listingId provided for FEATURED_LISTING');
          return;
        }

        const featuredUntil = new Date();
        featuredUntil.setDate(featuredUntil.getDate() + 30); // 30 days

        const listingRef = doc(db, 'listings', listingId);
        await updateDoc(listingRef, {
          isFeatured: true,
          featuredUntil: Timestamp.fromDate(featuredUntil),
          featuredPaidAt: serverTimestamp(),
          featuredPaidAmount: amount,
        });
        break;

      case 'BOOSTED_LISTING':
        if (!listingId) {
          console.error('No listingId provided for BOOSTED_LISTING');
          return;
        }

        const boostedUntil = new Date();
        boostedUntil.setDate(boostedUntil.getDate() + 7); // 7 days

        const boostedListingRef = doc(db, 'listings', listingId);
        await updateDoc(boostedListingRef, {
          isBoosted: true,
          boostedUntil: Timestamp.fromDate(boostedUntil),
          boostedPaidAt: serverTimestamp(),
          boostedPaidAmount: amount,
        });
        break;

      case 'VACANCY_LISTING':
        if (!listingId) {
          console.error('No listingId provided for VACANCY_LISTING');
          return;
        }

        const vacancyListingRef = doc(db, 'listings', listingId);
        await updateDoc(vacancyListingRef, {
          status: 'Vacant',
          vacancyPaidAt: serverTimestamp(),
          vacancyPaidAmount: amount,
        });
        break;
    }

    console.log(`Successfully updated permissions for user ${userId}, type: ${type}`);
  } catch (error) {
    console.error('Error updating user permissions:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting (50 requests per minute for callback endpoint)
    const clientIP = getClientIP(request);
    const rateLimitKey = `mpesa-callback:${clientIP}`;
    const allowed = rateLimiter.check(rateLimitKey, 50, 60 * 1000);

    if (!allowed) {
      console.warn(`Rate limit exceeded for M-Pesa callback from IP: ${clientIP}`);
      return NextResponse.json(
        { ResultCode: 1, ResultDesc: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Log all callbacks for debugging
    await logCallback(body);

    // Extract M-Pesa callback data
    const { Body } = body;
    if (!Body || !Body.stkCallback) {
      console.log('Invalid callback format');
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    const { stkCallback } = Body;
    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    console.log('M-Pesa Callback:', { CheckoutRequestID, ResultCode, ResultDesc });

    // Find transaction by CheckoutRequestID
    const transactionsRef = collection(db, 'transactions');
    const q = query(transactionsRef, where('checkoutRequestID', '==', CheckoutRequestID));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error('Transaction not found for CheckoutRequestID:', CheckoutRequestID);
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    const transactionDoc = querySnapshot.docs[0];
    const transaction = transactionDoc.data();

    // ResultCode 0 = Success, anything else = Failed
    const isSuccess = ResultCode === 0;

    const updateData: any = {
      status: isSuccess ? 'SUCCESS' : 'FAILED',
      statusMessage: ResultDesc,
      updatedAt: serverTimestamp(),
      completedAt: serverTimestamp(),
    };

    if (isSuccess && CallbackMetadata?.Item) {
      // Extract M-Pesa receipt number
      const metadataArray = CallbackMetadata.Item;
      const receiptItem = metadataArray.find((item: any) => item.Name === 'MpesaReceiptNumber');

      if (receiptItem) {
        updateData.mpesaReceiptNumber = receiptItem.Value;
      }

      // Update user permissions on successful payment
      await updateUserPermissions(
        transaction.userId,
        transaction.type as TransactionType,
        transaction.amount,
        transaction.listingId
      );

      // Update platform revenue statistics
      const platformSettingsRef = doc(db, 'platformSettings', 'config');
      await updateDoc(platformSettingsRef, {
        totalRevenue: (transaction.amount || 0),
        lastUpdated: serverTimestamp(),
      });

      // Log successful payment
      await logPaymentAttempt(
        transaction.userId,
        transaction.amount,
        true,
        CheckoutRequestID
      );
    } else {
      // Log failed payment
      await logPaymentAttempt(
        transaction.userId,
        transaction.amount,
        false,
        CheckoutRequestID
      );

      await logPaymentError(
        new Error(`Payment failed: ${ResultDesc}`),
        transaction.userId,
        CheckoutRequestID
      );
    }

    // Update transaction status
    await updateDoc(doc(db, 'transactions', transactionDoc.id), updateData);

    console.log(`Transaction ${transactionDoc.id} updated:`, updateData);

    // Always return success to M-Pesa
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });

  } catch (error: any) {
    console.error('Callback Handler Error:', error);

    // Still return success to M-Pesa to avoid retries
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
}

// Handle GET requests (M-Pesa might send test requests)
export async function GET() {
  return NextResponse.json({ message: 'M-Pesa callback endpoint active' });
}
