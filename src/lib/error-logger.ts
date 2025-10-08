/**
 * Error Logger
 * Centralized error logging and monitoring
 */

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase for server-side logging
const app = initializeApp(firebaseConfig, 'error-logger');
const db = getFirestore(app);

export interface ErrorLog {
  message: string;
  stack?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: 'AUTH' | 'DATABASE' | 'PAYMENT' | 'UPLOAD' | 'NETWORK' | 'OTHER';
  userId?: string;
  userEmail?: string;
  url?: string;
  userAgent?: string;
  timestamp: any;
  metadata?: Record<string, any>;
}

/**
 * Log error to Firestore
 */
export async function logError(
  error: Error | string,
  options: {
    severity?: ErrorLog['severity'];
    category?: ErrorLog['category'];
    userId?: string;
    userEmail?: string;
    metadata?: Record<string, any>;
  } = {}
) {
  try {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;

    const errorLog: ErrorLog = {
      message: errorMessage,
      stack: errorStack,
      severity: options.severity || 'MEDIUM',
      category: options.category || 'OTHER',
      userId: options.userId,
      userEmail: options.userEmail,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      timestamp: serverTimestamp(),
      metadata: options.metadata,
    };

    await addDoc(collection(db, 'error_logs'), errorLog);

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ERROR LOG]', errorLog);
    }
  } catch (loggingError) {
    // If logging fails, at least log to console
    console.error('Failed to log error:', loggingError);
    console.error('Original error:', error);
  }
}

/**
 * Log authentication errors
 */
export async function logAuthError(error: Error | string, userId?: string, userEmail?: string) {
  return logError(error, {
    severity: 'HIGH',
    category: 'AUTH',
    userId,
    userEmail,
  });
}

/**
 * Log payment errors
 */
export async function logPaymentError(
  error: Error | string,
  userId?: string,
  transactionId?: string
) {
  return logError(error, {
    severity: 'CRITICAL',
    category: 'PAYMENT',
    userId,
    metadata: { transactionId },
  });
}

/**
 * Log database errors
 */
export async function logDatabaseError(error: Error | string, operation?: string) {
  return logError(error, {
    severity: 'HIGH',
    category: 'DATABASE',
    metadata: { operation },
  });
}

/**
 * Log upload errors
 */
export async function logUploadError(error: Error | string, fileName?: string, fileSize?: number) {
  return logError(error, {
    severity: 'MEDIUM',
    category: 'UPLOAD',
    metadata: { fileName, fileSize },
  });
}

/**
 * Performance monitoring
 */
export async function logPerformanceMetric(
  operation: string,
  duration: number,
  metadata?: Record<string, any>
) {
  try {
    await addDoc(collection(db, 'performance_metrics'), {
      operation,
      duration,
      timestamp: serverTimestamp(),
      url: typeof window !== 'undefined' ? window.location.pathname : undefined,
      ...metadata,
    });
  } catch (error) {
    console.error('Failed to log performance metric:', error);
  }
}

/**
 * Track performance of async operations
 */
export async function trackPerformance<T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await fn();
    const duration = performance.now() - startTime;

    await logPerformanceMetric(operation, duration, metadata);

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;

    await logPerformanceMetric(operation, duration, {
      ...metadata,
      error: true,
    });

    throw error;
  }
}
