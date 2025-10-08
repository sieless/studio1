'use client';

import React, { useMemo, type ReactNode, useState, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [initError, setInitError] = useState<Error | null>(null);

  const firebaseServices = useMemo(() => {
    try {
      console.log('[FirebaseClientProvider] Initializing Firebase...');
      // Initialize Firebase on the client side, once per component mount.
      const services = initializeFirebase();
      console.log('[FirebaseClientProvider] Firebase initialized successfully');
      return services;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to initialize Firebase');
      console.error('[FirebaseClientProvider] Firebase initialization failed:', err);
      setInitError(err);
      throw err; // Re-throw to be caught by ErrorBoundary
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Log any initialization errors
  useEffect(() => {
    if (initError) {
      console.error('[FirebaseClientProvider] Initialization error:', initError);
    }
  }, [initError]);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}