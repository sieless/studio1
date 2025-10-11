'use client';

import React, { useMemo, useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [isClient, setIsClient] = useState(false);

  // Only initialize Firebase on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const firebaseServices = useMemo(() => {
    // Only initialize Firebase when we're on the client
    if (typeof window === 'undefined' || !isClient) {
      return null;
    }

    try {
      console.log('FirebaseClientProvider: Attempting to initialize Firebase...');
      const services = initializeFirebase();
      console.log('FirebaseClientProvider: Firebase initialized successfully');
      return services;
    } catch (error) {
      console.error('FirebaseClientProvider: Failed to initialize Firebase:', error);
      
      // Check if it's a configuration error
      if (error.message?.includes('Missing required Firebase configuration')) {
        console.error('FirebaseClientProvider: Please check your .env.local file');
      }
      
      // Return null to allow app to continue without Firebase
      return null;
    }
  }, [isClient]);

  // Always render with FirebaseProvider, even if services aren't ready
  // The provider will handle null services gracefully
  return (
    <FirebaseProvider
      firebaseApp={firebaseServices?.firebaseApp || null as any}
      auth={firebaseServices?.auth || null as any}
      firestore={firebaseServices?.firestore || null as any}
    >
      {children}
    </FirebaseProvider>
  );
}