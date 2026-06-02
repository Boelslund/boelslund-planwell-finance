import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { getDbInstance } from '../firebase';

// Constant arrays for possible values - single source of truth
export const THEME_OPTIONS = ['light', 'dark'] as const;
export const LANGUAGE_OPTIONS = ['en'] as const; // TODO: Add support for Danish language ('da')
export const DATE_FORMAT_OPTIONS = [
  'MM/DD/YYYY',
  'DD/MM/YYYY',
  'YYYY-MM-DD',
] as const;

// Derive types from constants
export type Theme = (typeof THEME_OPTIONS)[number];
export type Language = (typeof LANGUAGE_OPTIONS)[number];
export type DateFormat = (typeof DATE_FORMAT_OPTIONS)[number];

// Helper function to create option arrays for form inputs
const createOptions = <T extends readonly string[]>(
  values: T,
  labels?: Record<T[number], string>,
) => {
  return values.map((value: T[number]) => ({
    value,
    label: labels?.[value] || value,
  }));
};

// Export option arrays for form components
export const themeOptions = createOptions(THEME_OPTIONS, {
  light: 'Light',
  dark: 'Dark',
});

export const languageOptions = createOptions(LANGUAGE_OPTIONS, {
  en: 'English',
});

export const dateFormatOptions = createOptions(DATE_FORMAT_OPTIONS);

// ========================================
// SETTINGS (UI preferences)
// ========================================

export const DEFAULT_SETTINGS = {
  theme: 'light' as Theme,
  language: 'en' as Language,
  dateFormat: 'MM/DD/YYYY' as DateFormat,
} as const;

export interface Settings {
  theme: Theme;
  language: Language;
  dateFormat: DateFormat;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// ========================================
// NOTIFICATIONS
// ========================================

export const DEFAULT_NOTIFICATIONS = {
  email: false,
  budgetAlerts: false,
  monthlySummary: false,
} as const;

export interface NotificationSettings {
  email: boolean;
  budgetAlerts: boolean;
  monthlySummary: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// ========================================
// COMBINED (for backwards compatibility / convenience)
// ========================================

export const DEFAULT_USER_SETTINGS = {
  ...DEFAULT_SETTINGS,
  notifications: DEFAULT_NOTIFICATIONS,
} as const;

export interface UserSettings {
  theme: Theme;
  language: Language;
  dateFormat: DateFormat;
  notifications: {
    email: boolean;
    budgetAlerts: boolean;
    monthlySummary: boolean;
  };
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// ========================================
// SETTINGS CRUD
// ========================================

export async function createDefaultSettings(userId: string): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const settingsDoc = doc(getDbInstance(), 'users', userId, 'data', 'settings');
  const existing = await getDoc(settingsDoc);
  if (existing.exists()) {
    return;
  }

  const defaultSettings: Settings = {
    ...DEFAULT_SETTINGS,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };

  await setDoc(settingsDoc, defaultSettings);
}

export async function getSettings(userId: string): Promise<Settings | null> {
  if (!userId) {
    throw new Error('User ID is required');
  }
  const settingsDoc = doc(getDbInstance(), 'users', userId, 'data', 'settings');
  try {
    const docSnap = await getDoc(settingsDoc);
    if (docSnap.exists()) {
      return docSnap.data() as Settings;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get settings: ${message}`);
  }
  return null;
}

export async function updateSettings(
  userId: string,
  newSettings: Partial<Settings>,
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required');
  }
  if (Object.keys(newSettings).length === 0) {
    throw new Error('Updates object cannot be empty');
  }
  const settingsDoc = doc(getDbInstance(), 'users', userId, 'data', 'settings');
  try {
    const existingSettingsSnap = await getDoc(settingsDoc);
    if (!existingSettingsSnap.exists()) {
      throw new Error('Settings not found');
    }

    const existingSettings = existingSettingsSnap.data() as Settings;
    const updatedSettings: Settings = {
      ...existingSettings,
      ...newSettings,
      updatedAt: serverTimestamp() as Timestamp,
    };
    await setDoc(settingsDoc, updatedSettings);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to update settings: ${message}`);
  }
}

// ========================================
// NOTIFICATIONS CRUD
// ========================================

export async function createDefaultNotifications(userId: string): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const notificationsDoc = doc(getDbInstance(), 'users', userId, 'data', 'notifications');
  const existing = await getDoc(notificationsDoc);
  if (existing.exists()) {
    return;
  }

  const defaultNotifications: NotificationSettings = {
    ...DEFAULT_NOTIFICATIONS,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };

  await setDoc(notificationsDoc, defaultNotifications);
}

export async function getNotifications(userId: string): Promise<NotificationSettings | null> {
  if (!userId) {
    throw new Error('User ID is required');
  }
  const notificationsDoc = doc(getDbInstance(), 'users', userId, 'data', 'notifications');
  try {
    const docSnap = await getDoc(notificationsDoc);
    if (docSnap.exists()) {
      return docSnap.data() as NotificationSettings;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get notifications: ${message}`);
  }
  return null;
}

export async function updateNotifications(
  userId: string,
  newNotifications: Partial<NotificationSettings>,
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required');
  }
  if (Object.keys(newNotifications).length === 0) {
    throw new Error('Updates object cannot be empty');
  }
  const notificationsDoc = doc(getDbInstance(), 'users', userId, 'data', 'notifications');
  try {
    const existingNotificationsSnap = await getDoc(notificationsDoc);
    if (!existingNotificationsSnap.exists()) {
      throw new Error('Notifications not found');
    }

    const existingNotifications = existingNotificationsSnap.data() as NotificationSettings;
    const updatedNotifications: NotificationSettings = {
      ...existingNotifications,
      ...newNotifications,
      updatedAt: serverTimestamp() as Timestamp,
    };
    await setDoc(notificationsDoc, updatedNotifications);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to update notifications: ${message}`);
  }
}

// ========================================
// COMBINED FUNCTIONS (convenience / backwards compatibility)
// ========================================

export async function createDefaultUserSettings(userId: string): Promise<void> {
  await Promise.all([
    createDefaultSettings(userId),
    createDefaultNotifications(userId),
  ]);
}

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const [settings, notifications] = await Promise.all([
    getSettings(userId),
    getNotifications(userId),
  ]);

  if (!settings || !notifications) {
    return null;
  }

  return {
    ...settings,
    notifications: {
      email: notifications.email,
      budgetAlerts: notifications.budgetAlerts,
      monthlySummary: notifications.monthlySummary,
    },
  };
}

export async function updateUserSettings(
  userId: string,
  newSettings: Partial<UserSettings>,
): Promise<void> {
  const settingsUpdate: Partial<Settings> = {};
  const notificationsUpdate: Partial<NotificationSettings> = {};

  // Split updates into settings and notifications
  if (newSettings.theme !== undefined) settingsUpdate.theme = newSettings.theme;
  if (newSettings.language !== undefined) settingsUpdate.language = newSettings.language;
  if (newSettings.dateFormat !== undefined) settingsUpdate.dateFormat = newSettings.dateFormat;

  if (newSettings.notifications) {
    if (newSettings.notifications.email !== undefined) {
      notificationsUpdate.email = newSettings.notifications.email;
    }
    if (newSettings.notifications.budgetAlerts !== undefined) {
      notificationsUpdate.budgetAlerts = newSettings.notifications.budgetAlerts;
    }
    if (newSettings.notifications.monthlySummary !== undefined) {
      notificationsUpdate.monthlySummary = newSettings.notifications.monthlySummary;
    }
  }

  // Update both documents in parallel
  const updates: Promise<void>[] = [];
  if (Object.keys(settingsUpdate).length > 0) {
    updates.push(updateSettings(userId, settingsUpdate));
  }
  if (Object.keys(notificationsUpdate).length > 0) {
    updates.push(updateNotifications(userId, notificationsUpdate));
  }

  if (updates.length === 0) {
    throw new Error('Updates object cannot be empty');
  }

  await Promise.all(updates);
}
