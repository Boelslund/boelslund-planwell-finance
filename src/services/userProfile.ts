import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { getDbInstance } from '../firebase';

export interface UserProfile {
  email: string;
  displayName: string | null;
  createdAt: Timestamp;
}

/**
 * Creates a user profile document in Firestore
 * @param userId - The user's unique ID from Firebase Auth
 * @param email - The user's email address
 * @param displayName - Optional display name
 */
export async function createUserProfile(
  userId: string,
  email: string,
  displayName: string | null = null
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required');
  }
  if (!email) {
    throw new Error('Email is required');
  }

  const userDoc = doc(getDbInstance(), 'users', userId);
  await setDoc(userDoc, {
    email,
    displayName,
    createdAt: serverTimestamp(),
  });
}

/**
 * Retrieves a user profile from Firestore
 * @param userId - The user's unique ID
 * @returns User profile or null if not found
 */
export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const userDoc = doc(getDbInstance(), 'users', userId);
  const docSnap = await getDoc(userDoc);

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }

  return null;
}
