import * as Sentry from '@sentry/nextjs';

/**
 * Sentry Client Configuration
 *
 * Tracks errors that occur in the browser/client-side.
 * Features:
 * - Error tracking
 * - Performance monitoring
 * - User context
 * - Breadcrumbs for debugging
 *
 * Admin Control: Set NEXT_PUBLIC_SENTRY_DSN env var to enable
 */

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Environment
    environment: process.env.NODE_ENV,

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% when error occurs

    // Integrations
    integrations: [
      new Sentry.BrowserTracing({
        // Track performance of page navigations
        tracePropagationTargets: [
          'localhost',
          /^https:\/\/key-2-rent\.vercel\.app/,
          /^https:\/\/.*\.firebaseapp\.com/,
        ],
      }),
      new Sentry.Replay({
        // Mask all text and input fields
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Filter out noise
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',
      // Network errors
      'NetworkError',
      'Non-Error promise rejection captured',
      // Firebase expected errors
      'auth/popup-closed-by-user',
      'auth/cancelled-popup-request',
    ],

    // Tag all events with user context
    beforeSend(event, hint) {
      // Don't send events in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Sentry event (dev):', event);
        return null;
      }

      // Add custom tags
      if (event.tags) {
        event.tags.platform = 'key-2-rent';
      }

      return event;
    },
  });
}
