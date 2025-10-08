// Firebase configuration with fallback values for production
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDXDbd7n6pATyZnvEosKMWseWA8fg1mnU8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-8585842935-1485a.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-8585842935-1485a",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studio-8585842935-1485a.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "183517980169",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:183517980169:web:7a35cafdec76d857553ad8",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

// Validation function to be called during initialization
export function validateFirebaseConfig() {
  const requiredFields: (keyof typeof firebaseConfig)[] = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field]);

  if (missingFields.length > 0) {
    console.error('[Firebase Config] Missing required fields:', missingFields);
    throw new Error(`Firebase configuration is invalid. Missing: ${missingFields.join(', ')}`);
  }

  console.log('[Firebase Config] Configuration validated successfully');
}
