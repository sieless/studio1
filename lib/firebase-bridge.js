/**
 * Firebase Bridge
 * This file bridges the existing Firebase setup in src/firebase with the new setup in lib/firebase-config
 */

import { 
  getFirebaseApp, 
  getAuth, 
  getFirestore, 
  getStorage, 
  isFirebaseInitialized 
} from './firebase-config';

// Re-export for compatibility with existing code
export const app = getFirebaseApp;
export const auth = getAuth;
export const db = getFirestore;
export const storage = getStorage;
export const initialized = isFirebaseInitialized;

// Helper functions for type safety
export function useFirestoreWithFallback() {
  const firestore = getFirestore();
  if (!firestore) {
    console.warn('Firestore not initialized, operations may fail');
  }
  return firestore;
}

export function useAuthWithFallback() {
  const auth = getAuth();
  if (!auth) {
    console.warn('Auth not initialized, operations may fail');
  }
  return auth;
}

export function useStorageWithFallback() {
  const storage = getStorage();
  if (!storage) {
    console.warn('Storage not initialized, operations may fail');
  }
  return storage;
}

// Safe operation wrapper
export function withFirebase(operation, fallback = null) {
  if (isFirebaseInitialized()) {
    return operation();
  } else {
    console.warn('Firebase not initialized, returning fallback');
    return fallback;
  }
}