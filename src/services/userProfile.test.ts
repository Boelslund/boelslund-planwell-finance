import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUserProfile, getUserProfile } from './userProfile';
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

describe('User Profile Service', () => {
  const mockFirestore = {} as Firestore;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDbInstance).mockReturnValue(mockFirestore);
  });

  describe('createUserProfile', () => {
    it('should create a user profile document in Firestore', async () => {
      const { doc, setDoc, serverTimestamp } = await import(
        'firebase/firestore'
      );

      const mockDocRef = { id: 'user123' } as DocumentReference;
      vi.mocked(doc).mockReturnValue(mockDocRef);

      await createUserProfile('user123', 'test@example.com');

      expect(doc).toHaveBeenCalledWith(mockFirestore, 'users', 'user123');
      expect(setDoc).toHaveBeenCalledWith(mockDocRef, {
        email: 'test@example.com',
        displayName: null,
        createdAt: 'TIMESTAMP',
      });
      expect(serverTimestamp).toHaveBeenCalled();
    });

    it('should handle optional display name', async () => {
      const { doc, setDoc } = await import('firebase/firestore');

      const mockDocRef = { id: 'user123' } as DocumentReference;
      vi.mocked(doc).mockReturnValue(mockDocRef);

      await createUserProfile('user123', 'test@example.com', 'John Doe');

      expect(setDoc).toHaveBeenCalledWith(mockDocRef, {
        email: 'test@example.com',
        displayName: 'John Doe',
        createdAt: 'TIMESTAMP',
      });
    });

    it('should throw error if userId is empty', async () => {
      await expect(createUserProfile('', 'test@example.com')).rejects.toThrow(
        'User ID is required'
      );
    });

    it('should throw error if email is empty', async () => {
      await expect(createUserProfile('user123', '')).rejects.toThrow(
        'Email is required'
      );
    });
  });

  describe('getUserProfile', () => {
    it('should retrieve user profile from Firestore', async () => {
      const { doc, getDoc } = await import('firebase/firestore');

      const mockDocRef = { id: 'user123' } as DocumentReference;
      const mockDocSnap = {
        exists: () => true,
        data: () => ({
          email: 'test@example.com',
          displayName: 'John Doe',
          createdAt: 'TIMESTAMP',
        }),
      } as unknown as DocumentSnapshot;

      vi.mocked(doc).mockReturnValue(mockDocRef);
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap);

      const profile = await getUserProfile('user123');

      expect(doc).toHaveBeenCalledWith(mockFirestore, 'users', 'user123');
      expect(getDoc).toHaveBeenCalledWith(mockDocRef);
      expect(profile).toEqual({
        email: 'test@example.com',
        displayName: 'John Doe',
        createdAt: 'TIMESTAMP',
      });
    });

    it('should return null if user profile does not exist', async () => {
      const { doc, getDoc } = await import('firebase/firestore');

      const mockDocRef = { id: 'user123' } as DocumentReference;
      const mockDocSnap = {
        exists: () => false,
      } as unknown as DocumentSnapshot;

      vi.mocked(doc).mockReturnValue(mockDocRef);
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap);

      const profile = await getUserProfile('user123');

      expect(profile).toBeNull();
    });

    it('should throw error if userId is empty', async () => {
      await expect(getUserProfile('')).rejects.toThrow('User ID is required');
    });
  });
});
