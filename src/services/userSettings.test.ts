import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getUserSettings,
  updateUserSettings,
  createDefaultUserSettings,
  DEFAULT_USER_SETTINGS,
} from './userSettings';
import { getDbInstance } from '../firebase';
import type {
  Firestore,
  DocumentReference,
  DocumentSnapshot,
} from 'firebase/firestore';

// Mock Firebase
vi.mock('../firebase', () => ({
  getDbInstance: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'TIMESTAMP'),
}));

describe('User Settings Service', () => {
  const mockFirestore = {} as Firestore;
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDbInstance).mockReturnValue(mockFirestore);
  });

  describe('createDefaultUserSettings', () => {
    it('should create default user settings', async () => {
      const { doc, getDoc, setDoc } = await import('firebase/firestore');

      // Mock document references
      vi.mocked(doc).mockReturnValue({} as DocumentReference);
      
      // Mock getDoc to return non-existing documents (so defaults will be created)
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as unknown as DocumentSnapshot);

      await createDefaultUserSettings(mockUserId);

      // Should create both settings and notifications documents
      expect(setDoc).toHaveBeenCalled();
    });

    it('should throw error if userId is empty', async () => {
      await expect(createDefaultUserSettings('')).rejects.toThrow(
        'User ID is required',
      );
    });
  });

  describe('getUserSettings', () => {
    it('should retrieve user settings when they exist', async () => {
      const { doc, getDoc } = await import('firebase/firestore');

      const mockSettings = {
        dateFormat: 'DD/MM/YYYY',
        theme: 'dark',
        language: 'en',
        createdAt: 'TIMESTAMP',
        updatedAt: 'TIMESTAMP',
      };

      const mockNotifications = {
        email: false,
        budgetAlerts: true,
        monthlySummary: true,
        createdAt: 'TIMESTAMP',
        updatedAt: 'TIMESTAMP',
      };

      vi.mocked(doc).mockReturnValue({} as DocumentReference);
      vi.mocked(getDoc)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => mockSettings,
        } as unknown as DocumentSnapshot)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => mockNotifications,
        } as unknown as DocumentSnapshot);

      const settings = await getUserSettings(mockUserId);

      // Should combine settings and notifications
      expect(settings).toMatchObject({
        theme: 'dark',
        dateFormat: 'DD/MM/YYYY',
        language: 'en',
        notifications: {
          email: false,
          budgetAlerts: true,
          monthlySummary: true,
        },
      });
    });

    it('should return null if settings do not exist', async () => {
      const { doc, getDoc } = await import('firebase/firestore');

      vi.mocked(doc).mockReturnValue({} as DocumentReference);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as unknown as DocumentSnapshot);

      const settings = await getUserSettings(mockUserId);

      expect(settings).toBeNull();
    });

    it('should throw error if userId is empty', async () => {
      await expect(getUserSettings('')).rejects.toThrow('User ID is required');
    });
  });

  describe('updateUserSettings', () => {
    it('should update user settings', async () => {
      const { doc, setDoc, getDoc } = await import('firebase/firestore');

      vi.mocked(doc).mockReturnValue({} as DocumentReference);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({
          theme: 'light',
          language: 'en',
          dateFormat: 'MM/DD/YYYY',
        }),
      } as unknown as DocumentSnapshot);

      const updates = {
        theme: 'dark' as const,
        dateFormat: 'YYYY-MM-DD' as const,
      };

      await updateUserSettings(mockUserId, updates);

      expect(setDoc).toHaveBeenCalled();
    });

    it('should update notification settings', async () => {
      const { doc, setDoc, getDoc } = await import('firebase/firestore');

      vi.mocked(doc).mockReturnValue({} as DocumentReference);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({
          email: false,
          budgetAlerts: false,
          monthlySummary: false,
        }),
      } as unknown as DocumentSnapshot);

      const updates = {
        notifications: {
          email: true,
          budgetAlerts: true,
          monthlySummary: true,
        },
      };

      await updateUserSettings(mockUserId, updates);

      expect(setDoc).toHaveBeenCalled();
    });

    it('should throw error if userId is empty', async () => {
      await expect(updateUserSettings('', { theme: 'dark' })).rejects.toThrow(
        'User ID is required',
      );
    });

    it('should throw error if updates object is empty', async () => {
      await expect(updateUserSettings(mockUserId, {})).rejects.toThrow(
        'Updates object cannot be empty',
      );
    });
  });

  describe('Default Settings', () => {
    it('should provide default settings with correct values', () => {
      expect(DEFAULT_USER_SETTINGS).toEqual({
        theme: 'light',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        notifications: {
          email: false,
          budgetAlerts: false,
          monthlySummary: false,
        },
      });
    });
  });
});
