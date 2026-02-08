import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAnalytics, type Analytics } from 'firebase/analytics';
import {
  firebaseConfig,
  validateFirebaseConfig,
} from './config/firebase.config';

// Cached instances
let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let analyticsInstance: Analytics | null = null;

/**
 * Generic lazy instance getter factory
 * @param instance - Reference to the cached instance variable
 * @param initializer - Function to initialize the instance
 * @returns The cached or newly initialized instance
 */
function createInstanceGetter<T>(
  getInstance: () => T | null,
  setInstance: (instance: T) => void,
  initializer: () => T
): () => T {
  return () => {
    const current = getInstance();
    if (!current) {
      const newInstance = initializer();
      setInstance(newInstance);
      return newInstance;
    }
    return current;
  };
}

/**
 * Checks if the current environment is suitable for Firebase initialization
 * @returns true if Firebase can be initialized, false otherwise
 */
function isFirebaseEnvironment(): boolean {
  // Don't initialize in test environment
  if (import.meta.env.MODE === 'test') {
    return false;
  }

  // Don't initialize in SSR context (no window object)
  if (typeof window === 'undefined') {
    return false;
  }

  return true;
}

/**
 * Lazily initializes and returns the Firebase app instance
 * @returns Firebase app instance
 * @throws Error if Firebase cannot be initialized in the current environment
 */
export function getApp(): FirebaseApp {
  if (!isFirebaseEnvironment()) {
    throw new Error(
      'Firebase cannot be initialized in the current environment (test or SSR context)'
    );
  }

  if (!appInstance) {
    validateFirebaseConfig();
    appInstance = initializeApp(firebaseConfig);
  }

  return appInstance;
}

/**
 * Lazily initializes and returns the Firebase Auth instance
 * @returns Firebase Auth instance
 */
export const getAuthInstance = createInstanceGetter(
  () => authInstance,
  (instance) => { authInstance = instance; },
  () => getAuth(getApp())
);

/**
 * Lazily initializes and returns the Firestore instance
 * @returns Firestore instance
 */
export const getDbInstance = createInstanceGetter(
  () => dbInstance,
  (instance) => { dbInstance = instance; },
  () => getFirestore(getApp())
);

/**
 * Lazily initializes and returns the Analytics instance (production only)
 * @returns Analytics instance or null if not in production or if measurementId is missing
 */
export function getAnalyticsInstance(): Analytics | null {
  // Don't initialize if not in production or not in browser environment
  if (!import.meta.env.PROD || !isFirebaseEnvironment()) {
    return null;
  }

  // Don't initialize if measurementId is not provided
  if (!import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
    console.warn(
      'Firebase Analytics not initialized: VITE_FIREBASE_MEASUREMENT_ID is not set'
    );
    return null;
  }

  if (!analyticsInstance) {
    try {
      analyticsInstance = getAnalytics(getApp());
    } catch (error) {
      console.error('Failed to initialize Firebase Analytics:', error);
      return null;
    }
  }

  return analyticsInstance;
}
