/**
 * Firebase Service Layer
 * Provides a robust interface for Firebase operations with error handling, retries, and fallbacks
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  where,
  onSnapshot 
} from 'firebase/firestore';
import { db, auth, isFirebaseInitialized, getFirebaseStatus } from './firebase-config';

// Error types for better error handling
export const FirebaseErrorTypes = {
  NOT_INITIALIZED: 'firebase/not-initialized',
  CONFIG_INVALID: 'firebase/config-invalid',
  PERMISSION_DENIED: 'permission-denied',
  NOT_FOUND: 'not-found',
  NETWORK_ERROR: 'unavailable',
  QUOTA_EXCEEDED: 'resource-exhausted'
};

// Service configuration
const SERVICE_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000
};

class FirebaseService {
  constructor() {
    this.isReady = false;
    this.initPromise = null;
  }

  async ensureInitialized() {
    if (this.isReady) return true;

    const status = getFirebaseStatus();
    if (!status.initialized || !status.configValid) {
      throw new Error('Firebase is not properly configured');
    }

    this.isReady = true;
    return true;
  }

  async withRetry(operation, maxRetries = SERVICE_CONFIG.maxRetries) {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await this.ensureInitialized();
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Don't retry certain errors
        if (
          error.code === FirebaseErrorTypes.PERMISSION_DENIED ||
          error.code === FirebaseErrorTypes.NOT_FOUND ||
          error.code === FirebaseErrorTypes.QUOTA_EXCEEDED ||
          attempt === maxRetries
        ) {
          break;
        }

        // Wait before retrying
        const delay = SERVICE_CONFIG.retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  // Document operations
  async getDocument(path) {
    return this.withRetry(async () => {
      const docRef = doc(db, path);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    });
  }

  async addDocument(collectionPath, data) {
    return this.withRetry(async () => {
      const collectionRef = collection(db, collectionPath);
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    });
  }

  async updateDocument(path, data) {
    return this.withRetry(async () => {
      const docRef = doc(db, path);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      });
    });
  }

  async deleteDocument(path) {
    return this.withRetry(async () => {
      const docRef = doc(db, path);
      await deleteDoc(docRef);
    });
  }

  // Collection operations
  async getCollection(collectionPath, constraints = []) {
    return this.withRetry(async () => {
      const collectionRef = collection(db, collectionPath);
      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    });
  }

  // Real-time listeners
  subscribeToCollection(collectionPath, callback, constraints = []) {
    let unsubscribe = null;

    const setupListener = async () => {
      try {
        await this.ensureInitialized();
        
        const collectionRef = collection(db, collectionPath);
        const q = query(collectionRef, ...constraints);
        
        unsubscribe = onSnapshot(q, 
          (snapshot) => {
            const data = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            callback(data, null);
          },
          (error) => {
            console.error(`Error in ${collectionPath} listener:`, error);
            callback(null, error);
          }
        );
      } catch (error) {
        callback(null, error);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }

  subscribeToDocument(path, callback) {
    let unsubscribe = null;

    const setupListener = async () => {
      try {
        await this.ensureInitialized();
        
        const docRef = doc(db, path);
        
        unsubscribe = onSnapshot(docRef,
          (docSnap) => {
            if (docSnap.exists()) {
              callback({ id: docSnap.id, ...docSnap.data() }, null);
            } else {
              callback(null, null);
            }
          },
          (error) => {
            console.error(`Error in ${path} listener:`, error);
            callback(null, error);
          }
        );
      } catch (error) {
        callback(null, error);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }

  // Auth operations
  getCurrentUser() {
    return auth?.currentUser || null;
  }

  isAuthenticated() {
    return !!this.getCurrentUser();
  }

  // Utility methods
  async isOnline() {
    try {
      await this.getDocument('_health/check');
      return true;
    } catch (error) {
      return false;
    }
  }

  getErrorMessage(error) {
    const errorMessages = {
      [FirebaseErrorTypes.PERMISSION_DENIED]: 'You do not have permission to perform this action.',
      [FirebaseErrorTypes.NOT_FOUND]: 'The requested resource was not found.',
      [FirebaseErrorTypes.NETWORK_ERROR]: 'Network error. Please check your connection and try again.',
      [FirebaseErrorTypes.QUOTA_EXCEEDED]: 'Service quota exceeded. Please try again later.',
      [FirebaseErrorTypes.NOT_INITIALIZED]: 'Firebase service is not initialized.',
      [FirebaseErrorTypes.CONFIG_INVALID]: 'Firebase configuration is invalid.'
    };

    return errorMessages[error.code] || error.message || 'An unexpected error occurred.';
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();

// Helper functions for common operations
export const createDocument = (collection, data) => firebaseService.addDocument(collection, data);
export const readDocument = (path) => firebaseService.getDocument(path);
export const updateDocument = (path, data) => firebaseService.updateDocument(path, data);
export const deleteDocument = (path) => firebaseService.deleteDocument(path);
export const readCollection = (collection, constraints) => firebaseService.getCollection(collection, constraints);
export const listenToCollection = (collection, callback, constraints) => firebaseService.subscribeToCollection(collection, callback, constraints);
export const listenToDocument = (path, callback) => firebaseService.subscribeToDocument(path, callback);

export default firebaseService;