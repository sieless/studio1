import * as Sentry from '@sentry/nextjs';

/**
 * Sentry Edge Configuration
 *
 * Tracks errors in Edge Runtime (middleware, edge functions).
 *
 * Admin Control: Set SENTRY_DSN env var to enable
 */

const SENTRY_DSN = process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,

    beforeSend(event) {
      if (process.env.NODE_ENV === 'development') {
        return null;
      }
      return event;
    },
  });
}
