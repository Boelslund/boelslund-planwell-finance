import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAnalytics, type Analytics } from 'firebase/analytics';
import { firebaseConfig } from './config/firebase.config';

// Cached instances
let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let analyticsInstance: Analytics | null = null;

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
    appInstance = initializeApp(firebaseConfig);
  }

  return appInstance;
}

/**
 * Lazily initializes and returns the Firebase Auth instance
 * @returns Firebase Auth instance
 */
export function getAuthInstance(): Auth {
  if (!authInstance) {
    authInstance = getAuth(getApp());
  }
  return authInstance;
}

/**
 * Lazily initializes and returns the Firestore instance
 * @returns Firestore instance
 */
export function getDbInstance(): Firestore {
  if (!dbInstance) {
    dbInstance = getFirestore(getApp());
  }
  return dbInstance;
}

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
