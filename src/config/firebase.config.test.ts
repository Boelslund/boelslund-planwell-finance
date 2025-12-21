import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock import.meta.env at the module level
const mockEnv = vi.hoisted(() => ({
  VITE_FIREBASE_API_KEY: 'test-api-key' as string | undefined,
  VITE_FIREBASE_AUTH_DOMAIN: 'test-auth-domain' as string | undefined,
  VITE_FIREBASE_PROJECT_ID: 'test-project-id' as string | undefined,
  VITE_FIREBASE_STORAGE_BUCKET: 'test-storage-bucket' as string | undefined,
  VITE_FIREBASE_MESSAGING_SENDER_ID: 'test-sender-id' as string | undefined,
  VITE_FIREBASE_APP_ID: 'test-app-id' as string | undefined,
  VITE_FIREBASE_MEASUREMENT_ID: 'test-measurement-id' as string | undefined,
}));

vi.mock('./firebase.config', async () => {
  const actual = await vi.importActual<typeof import('./firebase.config')>(
    './firebase.config'
  );
  return {
    ...actual,
    validateFirebaseConfig: () => {
      const requiredEnvVars = [
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_PROJECT_ID',
        'VITE_FIREBASE_STORAGE_BUCKET',
        'VITE_FIREBASE_MESSAGING_SENDER_ID',
        'VITE_FIREBASE_APP_ID',
      ];

      const missingVars = requiredEnvVars.filter(
        (varName) => !mockEnv[varName as keyof typeof mockEnv]
      );

      if (missingVars.length > 0) {
        throw new Error(
          `Missing required Firebase environment variables: ${missingVars.join(
            ', '
          )}\n` + 'Please ensure these variables are set in your .env file.'
        );
      }
    },
    firebaseConfig: {
      apiKey: mockEnv.VITE_FIREBASE_API_KEY,
      authDomain: mockEnv.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: mockEnv.VITE_FIREBASE_PROJECT_ID,
      storageBucket: mockEnv.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: mockEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: mockEnv.VITE_FIREBASE_APP_ID,
      measurementId: mockEnv.VITE_FIREBASE_MEASUREMENT_ID,
    },
  };
});

describe('Firebase Configuration', () => {
  beforeEach(() => {
    // Reset mock env to default values
    Object.assign(mockEnv, {
      VITE_FIREBASE_API_KEY: 'test-api-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'test-auth-domain',
      VITE_FIREBASE_PROJECT_ID: 'test-project-id',
      VITE_FIREBASE_STORAGE_BUCKET: 'test-storage-bucket',
      VITE_FIREBASE_MESSAGING_SENDER_ID: 'test-sender-id',
      VITE_FIREBASE_APP_ID: 'test-app-id',
      VITE_FIREBASE_MEASUREMENT_ID: 'test-measurement-id',
    });
  });

  describe('validateFirebaseConfig', () => {
    it('should not throw error when all required environment variables are present', async () => {
      const { validateFirebaseConfig } = await import('./firebase.config');
      expect(() => validateFirebaseConfig()).not.toThrow();
    });

    it('should throw error when VITE_FIREBASE_API_KEY is missing', async () => {
      delete mockEnv.VITE_FIREBASE_API_KEY;
      const { validateFirebaseConfig } = await import('./firebase.config');

      expect(() => validateFirebaseConfig()).toThrow(
        'Missing required Firebase environment variables: VITE_FIREBASE_API_KEY'
      );
    });

    it('should throw error when VITE_FIREBASE_AUTH_DOMAIN is missing', async () => {
      delete mockEnv.VITE_FIREBASE_AUTH_DOMAIN;
      const { validateFirebaseConfig } = await import('./firebase.config');

      expect(() => validateFirebaseConfig()).toThrow(
        'Missing required Firebase environment variables: VITE_FIREBASE_AUTH_DOMAIN'
      );
    });

    it('should throw error when VITE_FIREBASE_PROJECT_ID is missing', async () => {
      delete mockEnv.VITE_FIREBASE_PROJECT_ID;
      const { validateFirebaseConfig } = await import('./firebase.config');

      expect(() => validateFirebaseConfig()).toThrow(
        'Missing required Firebase environment variables: VITE_FIREBASE_PROJECT_ID'
      );
    });

    it('should throw error when multiple required variables are missing', async () => {
      delete mockEnv.VITE_FIREBASE_AUTH_DOMAIN;
      delete mockEnv.VITE_FIREBASE_PROJECT_ID;
      delete mockEnv.VITE_FIREBASE_MESSAGING_SENDER_ID;
      delete mockEnv.VITE_FIREBASE_APP_ID;
      const { validateFirebaseConfig } = await import('./firebase.config');

      expect(() => validateFirebaseConfig()).toThrow(
        'Missing required Firebase environment variables: VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID'
      );
    });

    it('should include helpful message in error', async () => {
      delete mockEnv.VITE_FIREBASE_API_KEY;
      const { validateFirebaseConfig } = await import('./firebase.config');

      expect(() => validateFirebaseConfig()).toThrow(
        'Please ensure these variables are set in your .env file.'
      );
    });

    it('should not require VITE_FIREBASE_MEASUREMENT_ID (optional)', async () => {
      delete mockEnv.VITE_FIREBASE_MEASUREMENT_ID;
      const { validateFirebaseConfig } = await import('./firebase.config');

      expect(() => validateFirebaseConfig()).not.toThrow();
    });
  });

  describe('firebaseConfig export', () => {
    it('should export config object with all required properties', async () => {
      const { firebaseConfig } = await import('./firebase.config');
      expect(firebaseConfig).toHaveProperty('apiKey');
      expect(firebaseConfig).toHaveProperty('authDomain');
      expect(firebaseConfig).toHaveProperty('projectId');
      expect(firebaseConfig).toHaveProperty('storageBucket');
      expect(firebaseConfig).toHaveProperty('messagingSenderId');
      expect(firebaseConfig).toHaveProperty('appId');
      expect(firebaseConfig).toHaveProperty('measurementId');
    });

    it('should map environment variables to config properties correctly', async () => {
      const { firebaseConfig } = await import('./firebase.config');

      expect(firebaseConfig.apiKey).toBe('test-api-key');
      expect(firebaseConfig.authDomain).toBe('test-auth-domain');
      expect(firebaseConfig.projectId).toBe('test-project-id');
      expect(firebaseConfig.storageBucket).toBe('test-storage-bucket');
      expect(firebaseConfig.messagingSenderId).toBe('test-sender-id');
      expect(firebaseConfig.appId).toBe('test-app-id');
      expect(firebaseConfig.measurementId).toBe('test-measurement-id');
    });
  });
});
