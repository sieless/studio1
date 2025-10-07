import * as Sentry from '@sentry/nextjs';

/**
 * Sentry Server Configuration
 *
 * Tracks errors that occur on the server-side (API routes, server components).
 * Features:
 * - Error tracking
 * - Performance monitoring
 * - Server action tracking
 *
 * Admin Control: Set SENTRY_DSN env var to enable
 */

const SENTRY_DSN = process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Environment
    environment: process.env.NODE_ENV,

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Filter out noise
    ignoreErrors: [
      // Firebase admin errors
      'auth/id-token-expired',
      'auth/argument-error',
      // Expected errors
      'ECONNREFUSED',
      'ETIMEDOUT',
    ],

    // Tag all events
    beforeSend(event) {
      // Don't send events in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Sentry server event (dev):', event);
        return null;
      }

      if (event.tags) {
        event.tags.platform = 'key-2-rent-server';
      }

      return event;
    },
  });
}
