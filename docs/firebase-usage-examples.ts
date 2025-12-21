/**
 * Firebase Usage Examples
 *
 * This file demonstrates how to use the lazy-initialized Firebase services
 * in different contexts.
 */

// ============================================================================
// RECOMMENDED: Use getter functions for explicit lazy initialization
// ============================================================================

import {
  getApp,
  getAuthInstance,
  getDbInstance,
  getAnalyticsInstance,
} from '../src/firebase';

// Example 1: Initialize only when needed
export function setupAuthentication() {
  try {
    const auth = getAuthInstance();
    // Use auth service...
    console.log('Auth initialized:', auth);
  } catch (error) {
    console.error('Failed to initialize auth:', error);
  }
}

// Example 2: Initialize Firestore only when database operations are needed
export async function fetchUserData(userId: string) {
  try {
    const db = getDbInstance();
    // Use db service...
    console.log('Database initialized for user:', userId, db);
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

// Example 3: Analytics (production only, requires measurementId)
export function trackPageView(pageName: string) {
  const analytics = getAnalyticsInstance();
  if (analytics) {
    // Track event with analytics
    console.log('Tracking page view:', pageName);
  } else {
    // Analytics is not available in:
    // - Development mode
    // - Test environment
    // - When VITE_FIREBASE_MEASUREMENT_ID is not set
    // - SSR contexts
    console.log('Analytics not available');
  }
}

// ============================================================================
// TESTING: Mock Firebase in tests
// ============================================================================

/**
 * In test files, you can mock the getter functions:
 *
 * import { vi } from 'vitest'
 * import * as firebase from '../firebase'
 *
 * vi.spyOn(firebase, 'getAuthInstance').mockReturnValue({
 *   currentUser: { uid: 'test-user-123' }
 * } as any)
 */

// ============================================================================
// BEST PRACTICES
// ============================================================================

/**
 * 1. Use getter functions (getAuthInstance, getDbInstance, etc.) for explicit control
 * 2. Wrap Firebase calls in try-catch blocks to handle initialization errors
 * 3. Always check if analytics is available before using it (returns null when unavailable)
 * 4. Analytics requires VITE_FIREBASE_MEASUREMENT_ID to be set and production mode
 * 5. Mock Firebase services in unit tests using the getter functions
 * 6. Services are cached after first initialization for performance
 */
