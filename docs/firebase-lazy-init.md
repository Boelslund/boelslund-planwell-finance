# Firebase Lazy Initialization

## Overview

The Firebase services in this project now use **lazy initialization** to prevent initialization errors in test environments and SSR contexts. This means Firebase services are only initialized when they are first accessed, not when the module is imported.

## Key Benefits

1. **Test-Friendly**: Firebase won't initialize in test environments, preventing errors and unwanted side effects
2. **SSR-Compatible**: Services won't initialize in server-side rendering contexts where `window` is undefined
3. **Performance**: Services are only initialized when actually needed
4. **Cached**: Once initialized, service instances are reused for better performance

## Usage

### Recommended: Use Getter Functions

The recommended approach is to use the getter functions for explicit control:

```typescript
import { getAuthInstance, getDbInstance, getAnalyticsInstance } from './firebase'

// Initialize auth only when needed
function login() {
  const auth = getAuthInstance()
  // Use auth...
}

// Initialize Firestore only when needed
async function saveData() {
  const db = getDbInstance()
  // Use db...
}

// Analytics (returns null in development)
function trackEvent() {
  const analytics = getAnalyticsInstance()
  if (analytics) {
    // Track with analytics
  } else {
    // Analytics not available (development mode, missing measurementId, or error)
  }
}
```

### Legacy: Direct Exports (Backward Compatible)

The legacy exports still work but use proxies under the hood:

```typescript
import { auth, db, analytics } from './firebase'

// These work in browser environments
console.log(auth.currentUser)
```

**Note**: Legacy exports will throw errors in test environments to encourage using the getter functions.

## Environment Detection

Firebase initialization is blocked in:

- **Test environments**: When `import.meta.env.MODE === 'test'`
- **SSR contexts**: When `typeof window === 'undefined'`

### Analytics-Specific Checks

Firebase Analytics will only initialize when ALL of the following conditions are met:

1. **Production mode**: `import.meta.env.PROD === true`
2. **Browser environment**: `typeof window !== 'undefined'`
3. **Measurement ID exists**: `import.meta.env.VITE_FIREBASE_MEASUREMENT_ID` is set

If any condition fails, `getAnalyticsInstance()` returns `null` gracefully.

## Testing

In your tests, mock the getter functions:

```typescript
import { vi } from 'vitest'
import * as firebase from './firebase'

// Mock auth
vi.spyOn(firebase, 'getAuthInstance').mockReturnValue({
  currentUser: { uid: 'test-user' }
} as any)

// Mock Firestore
vi.spyOn(firebase, 'getDbInstance').mockReturnValue({
  collection: vi.fn()
} as any)
```

## Error Handling

Always wrap Firebase calls in try-catch blocks:

```typescript
try {
  const auth = getAuthInstance()
  // Use auth...
} catch (error) {
  console.error('Firebase initialization failed:', error)
  // Handle gracefully
}
```

## Migration Guide

If you're using the old direct exports, no changes are required. However, for better test compatibility, consider migrating to getter functions:

**Before:**
```typescript
import { auth } from './firebase'
auth.signInWithEmailAndPassword(email, password)
```

**After:**
```typescript
import { getAuthInstance } from './firebase'
const auth = getAuthInstance()
auth.signInWithEmailAndPassword(email, password)
```

## See Also

- `docs/firebase-usage-examples.ts` - Comprehensive usage examples
- `src/config/firebase.config.ts` - Configuration and validation
- `src/firebase.ts` - Firebase initialization implementation
