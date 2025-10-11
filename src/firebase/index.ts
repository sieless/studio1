'use client';

import { firebaseConfig, validateFirebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// Fixed Firebase initialization function
export function initializeFirebase() {
  try {
    console.log('🔥 Initializing Firebase...');
    
    // Validate configuration first
    validateFirebaseConfig();
    
    // Get existing apps
    const existingApps = getApps();
    
    let firebaseApp;
    
    if (existingApps.length === 0) {
      // No existing apps, create new one
      console.log('🔥 Creating new Firebase app');
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      // Use existing app
      console.log('🔥 Using existing Firebase app');
      firebaseApp = existingApps[0];
    }
    
    // Initialize services
    const auth = getAuth(firebaseApp);
    const firestore = getFirestore(firebaseApp);
    
    console.log('🔥 Firebase initialization complete');
    
    return {
      firebaseApp,
      auth,
      firestore
    };
  } catch (error) {
    console.error('🔥 Firebase initialization error:', error);
    throw error;
  }
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
