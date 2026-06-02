import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  createDefaultUserSettings,
  getUserSettings,
  updateUserSettings,
  type UserSettings
} from "../services/userSettings";

interface SettingsContextType {
  settings: UserSettings | null;
  loading: boolean;
  error: string;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

// In-memory cache for user settings
const settingsCache = new Map<string, UserSettings>();

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }

  return context;
}

// Helper function to clear cache (useful for testing or manual cache invalidation)
// eslint-disable-next-line react-refresh/only-export-components
export function clearSettingsCache() {
  settingsCache.clear();
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  // Initialize loading to true since we always start with auth loading
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Don't attempt to load settings until auth is ready
    if (authLoading) {
      // Loading is already true from initialization
      return;
    }

    // Handle settings loading asynchronously to avoid synchronous setState in effect
    const handleSettingsLoad = async () => {
      // Clear settings and cache when user logs out
      if (!user) {
        setSettings(null);
        setError('');
        setLoading(false);
        // Clear cache for all users on logout
        settingsCache.clear();
        return;
      }

      // Load settings for authenticated user
      try {
        setLoading(true);
        setError('');

        // Check cache first
        const cachedSettings = settingsCache.get(user.uid);
        if (cachedSettings) {
          setSettings(cachedSettings);
          setLoading(false);
          return;
        }

        let userSettings = await getUserSettings(user.uid);

        // Create default settings if none exist
        if (!userSettings) {
          await createDefaultUserSettings(user.uid);
          userSettings = await getUserSettings(user.uid);
        }

        // Cache the settings
        if (userSettings) {
          settingsCache.set(user.uid, userSettings);
        }

        setSettings(userSettings);
      } catch (err) {
        const errorDetails = err instanceof Error ? err.message : 'Unknown error';
        const errorMessage = `Failed to load user settings: ${errorDetails}`;
        setError(errorMessage);
        console.error('Failed to load user settings:', err);
      } finally {
        setLoading(false);
      }
    };

    handleSettingsLoad();
  }, [user, authLoading]);

  // Apply theme class to body
  useEffect(() => {
    if (settings?.theme) {
      // Remove any existing theme classes
      document.body.classList.remove('theme-light', 'theme-dark');
      // Add current theme class
      document.body.classList.add(`theme-${settings.theme}`);
    } else {
      // Remove theme classes when no settings (user logged out)
      document.body.classList.remove('theme-light', 'theme-dark');
    }
  }, [settings?.theme]);

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) {
      throw new Error('User must be authenticated to update settings');
    }

    const previousSettings = settings;
    let updatedSettings: UserSettings | null = null;

    try {
      setError('');

      // Use functional update to handle concurrent updates correctly
      setSettings((prev) => {
        updatedSettings = prev ? { ...prev, ...newSettings } : null;
        return updatedSettings;
      });

      await updateUserSettings(user.uid, newSettings);

      // Update cache with new settings
      if (updatedSettings) {
        settingsCache.set(user.uid, updatedSettings);
      }
    } catch (err) {
      handleUpdateFailure(previousSettings);
      const errorDetails = err instanceof Error ? err.message : 'Unknown error';
      const errorMessage = `Failed to update settings: ${errorDetails}`;
      setError(errorMessage);
      throw err;
    }
  };

  const refreshSettings = async () => {
    if (!user) {
      return;
    }

    try {
      setError('');
      // Invalidate cache and fetch fresh settings
      settingsCache.delete(user.uid);
      const userSettings = await getUserSettings(user.uid);

      // Update cache with fresh settings
      if (userSettings) {
        settingsCache.set(user.uid, userSettings);
      }

      setSettings(userSettings);
    } catch (err) {
      const errorDetails = err instanceof Error ? err.message : 'Unknown error';
      const errorMessage = `Failed to refresh settings: ${errorDetails}`;
      setError(errorMessage);
      console.error('Failed to refresh settings:', err);
    }
  };

  const handleUpdateFailure = (previousSettings: UserSettings | null) => {
    setSettings(previousSettings);
  };

  return (
    <SettingsContext.Provider value={
      {
        settings,
        loading,
        error,
        updateSettings,
        refreshSettings
      }}>
      {children}
    </SettingsContext.Provider>
  );
}
