'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  console.log('[Firebase Init] Starting initialization...');
  console.log('[Firebase Init] Config check:', {
    hasApiKey: !!firebaseConfig.apiKey,
    hasAuthDomain: !!firebaseConfig.authDomain,
    hasProjectId: !!firebaseConfig.projectId,
    projectId: firebaseConfig.projectId
  });

  if (!getApps().length) {
    console.log('[Firebase Init] No apps exist, initializing new app...');
    // Always use firebaseConfig for consistent initialization
    // This prevents the "no-options" error in production
    const firebaseApp = initializeApp(firebaseConfig);
    console.log('[Firebase Init] App initialized successfully');
    return getSdks(firebaseApp);
  }

  // If already initialized, return the SDKs with the already initialized App
  console.log('[Firebase Init] Using existing app');
  return getSdks(getApp());
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
