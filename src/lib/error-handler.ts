/**
 * Centralized error handling utilities
 */

import { FirebaseError } from 'firebase/app';

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Converts Firebase errors to user-friendly messages
 */
export function getFirebaseErrorMessage(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return 'An unexpected error occurred. Please try again.';
  }

  const errorMessages: Record<string, string> = {
    // Auth errors
    'auth/email-already-in-use': 'This email is already registered. Please login instead.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/operation-not-allowed': 'This operation is not allowed.',
    'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Invalid login credentials.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
    'auth/cancelled-popup-request': 'Sign-in cancelled.',
    'auth/invalid-phone-number': 'Invalid phone number format.',
    'auth/missing-phone-number': 'Please provide a phone number.',
    'auth/quota-exceeded': 'SMS quota exceeded. Please try again later.',
    'auth/invalid-verification-code': 'Invalid OTP code. Please check and try again.',
    'auth/code-expired': 'OTP code has expired. Please request a new one.',

    // Firestore errors
    'permission-denied': 'You do not have permission to perform this action.',
    'not-found': 'The requested resource was not found.',
    'already-exists': 'This resource already exists.',
    'failed-precondition': 'Operation failed. Please check your data and try again.',
    'resource-exhausted': 'Too many requests. Please try again later.',
    'unauthenticated': 'Please log in to continue.',
    'unavailable': 'Service temporarily unavailable. Please try again.',
    'deadline-exceeded': 'Operation timed out. Please try again.',
    'aborted': 'Operation was cancelled. Please try again.',

    // Storage errors
    'storage/unauthorized': 'You are not authorized to upload files.',
    'storage/canceled': 'Upload was cancelled.',
    'storage/unknown': 'An unknown error occurred during upload.',
    'storage/object-not-found': 'File not found.',
    'storage/bucket-not-found': 'Storage bucket not configured.',
    'storage/project-not-found': 'Project not found.',
    'storage/quota-exceeded': 'Storage quota exceeded.',
    'storage/unauthenticated': 'Please log in to upload files.',
    'storage/retry-limit-exceeded': 'Upload failed after multiple retries.',
    'storage/invalid-checksum': 'File upload failed. Please try again.',
  };

  return errorMessages[error.code] || `Error: ${error.message}`;
}

/**
 * Logs error to console (and optionally to error tracking service)
 */
export function logError(error: unknown, context?: Record<string, any>): void {
  console.error('Error occurred:', {
    error,
    context,
    timestamp: new Date().toISOString(),
  });

  // TODO: Send to error tracking service (Sentry, etc.)
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { extra: context });
  // }
}

/**
 * Handles errors with user feedback
 */
export function handleError(
  error: unknown,
  options: {
    toast?: (params: { title: string; description: string; variant?: string }) => void;
    context?: Record<string, any>;
    fallbackMessage?: string;
  } = {}
): void {
  const { toast, context, fallbackMessage = 'An error occurred' } = options;

  logError(error, context);

  const message = error instanceof Error
    ? getFirebaseErrorMessage(error)
    : fallbackMessage;

  if (toast) {
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
  }
}

/**
 * Wraps async functions with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorHandler?: (error: unknown) => void
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (errorHandler) {
        errorHandler(error);
      } else {
        logError(error);
      }
      throw error;
    }
  }) as T;
}

/**
 * Validates required fields in an object
 */
export function validateRequiredFields<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): { valid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter(
    (field) => !data[field] || (typeof data[field] === 'string' && data[field].trim() === '')
  );

  return {
    valid: missingFields.length === 0,
    missingFields: missingFields.map(String),
  };
}
