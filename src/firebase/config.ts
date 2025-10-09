/**
 * Firebase Configuration
 *
 * NOTE: Validation is done at runtime (when Firebase is actually used),
 * not at build time. This allows the build to succeed even if env vars
 * aren't set, which is necessary for CI/CD pipelines.
 */

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
};

/**
 * Validates that all required Firebase environment variables are set
 * Call this at runtime when Firebase is actually needed
 */
export function validateFirebaseConfig(): void {
  const requiredVars = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ] as const;

  const missing = requiredVars.filter(key => !firebaseConfig[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required Firebase configuration: ${missing.join(', ')}\n` +
      `Please ensure all NEXT_PUBLIC_FIREBASE_* environment variables are set.\n` +
      `See .env.example for the required variables.`
    );
  }
}
