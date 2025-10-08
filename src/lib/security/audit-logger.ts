/**
 * Security Audit Logger
 * Track security-relevant events
 */

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

const app = initializeApp(firebaseConfig, 'audit-logger');
const db = getFirestore(app);

export type AuditEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGOUT'
  | 'PASSWORD_CHANGE'
  | 'PROFILE_UPDATE'
  | 'PAYMENT_ATTEMPT'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILURE'
  | 'ADMIN_ACTION'
  | 'SUSPICIOUS_ACTIVITY'
  | 'RATE_LIMIT_HIT'
  | 'UNAUTHORIZED_ACCESS';

export interface AuditLog {
  eventType: AuditEventType;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  timestamp: any;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

/**
 * Log security event to Firestore
 */
export async function logAuditEvent(
  eventType: AuditEventType,
  options: {
    userId?: string;
    userEmail?: string;
    ipAddress?: string;
    details?: Record<string, any>;
    severity?: AuditLog['severity'];
  } = {}
) {
  try {
    const auditLog: AuditLog = {
      eventType,
      userId: options.userId,
      userEmail: options.userEmail,
      ipAddress: options.ipAddress || getClientIP(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      details: options.details,
      timestamp: serverTimestamp(),
      severity: options.severity || getSeverity(eventType),
    };

    await addDoc(collection(db, 'security_logs'), auditLog);

    // Also log critical events to console
    if (auditLog.severity === 'CRITICAL') {
      console.warn('[SECURITY AUDIT - CRITICAL]', auditLog);
    }
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

/**
 * Get client IP address (from headers in API routes)
 */
function getClientIP(): string | undefined {
  if (typeof window !== 'undefined') {
    // Client-side: can't get real IP
    return undefined;
  }
  // Server-side would extract from request headers
  return undefined;
}

/**
 * Get severity based on event type
 */
function getSeverity(eventType: AuditEventType): AuditLog['severity'] {
  switch (eventType) {
    case 'LOGIN_FAILURE':
    case 'UNAUTHORIZED_ACCESS':
    case 'SUSPICIOUS_ACTIVITY':
      return 'HIGH';
    case 'PAYMENT_FAILURE':
    case 'RATE_LIMIT_HIT':
      return 'MEDIUM';
    case 'ADMIN_ACTION':
      return 'HIGH';
    case 'LOGIN_SUCCESS':
    case 'LOGOUT':
    case 'PROFILE_UPDATE':
      return 'LOW';
    default:
      return 'MEDIUM';
  }
}

/**
 * Specific audit log functions
 */

export async function logLoginAttempt(
  success: boolean,
  email: string,
  userId?: string
) {
  return logAuditEvent(success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILURE', {
    userEmail: email,
    userId,
    severity: success ? 'LOW' : 'HIGH',
  });
}

export async function logPasswordChange(userId: string, userEmail: string) {
  return logAuditEvent('PASSWORD_CHANGE', {
    userId,
    userEmail,
    severity: 'MEDIUM',
  });
}

export async function logPaymentAttempt(
  userId: string,
  amount: number,
  success: boolean,
  transactionId?: string
) {
  return logAuditEvent(success ? 'PAYMENT_SUCCESS' : 'PAYMENT_FAILURE', {
    userId,
    details: { amount, transactionId },
    severity: success ? 'LOW' : 'MEDIUM',
  });
}

export async function logAdminAction(
  adminEmail: string,
  action: string,
  details?: Record<string, any>
) {
  return logAuditEvent('ADMIN_ACTION', {
    userEmail: adminEmail,
    details: { action, ...details },
    severity: 'HIGH',
  });
}

export async function logSuspiciousActivity(
  reason: string,
  userId?: string,
  details?: Record<string, any>
) {
  return logAuditEvent('SUSPICIOUS_ACTIVITY', {
    userId,
    details: { reason, ...details },
    severity: 'CRITICAL',
  });
}

export async function logRateLimitHit(
  endpoint: string,
  userId?: string,
  ipAddress?: string
) {
  return logAuditEvent('RATE_LIMIT_HIT', {
    userId,
    ipAddress,
    details: { endpoint },
    severity: 'MEDIUM',
  });
}
