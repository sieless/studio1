'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION LOGIC
export function initializeFirebase() {
  try {
    console.log('[initializeFirebase] Starting initialization...');
    console.log('[initializeFirebase] Current apps count:', getApps().length);

    if (!getApps().length) {
      // Always use firebaseConfig for consistent initialization
      // This prevents the "no-options" error in production
      console.log('[initializeFirebase] Initializing new Firebase app with config:', {
        apiKey: firebaseConfig.apiKey ? '***' : 'MISSING',
        authDomain: firebaseConfig.authDomain || 'MISSING',
        projectId: firebaseConfig.projectId || 'MISSING',
        storageBucket: firebaseConfig.storageBucket || 'MISSING',
      });

      const firebaseApp = initializeApp(firebaseConfig);
      console.log('[initializeFirebase] Firebase app initialized successfully');
      return getSdks(firebaseApp);
    }

    // If already initialized, return the SDKs with the already initialized App
    console.log('[initializeFirebase] Using existing Firebase app');
    return getSdks(getApp());
  } catch (error) {
    console.error('[initializeFirebase] Error during initialization:', error);
    throw error;
  }
}

export function getSdks(firebaseApp: FirebaseApp) {
  try {
    console.log('[getSdks] Getting Firebase SDKs...');
    const auth = getAuth(firebaseApp);
    const firestore = getFirestore(firebaseApp);
    console.log('[getSdks] SDKs retrieved successfully');

    return {
      firebaseApp,
      auth,
      firestore
    };
  } catch (error) {
    console.error('[getSdks] Error getting SDKs:', error);
    throw error;
  }
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
