import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { SettingsProvider, useSettings, clearSettingsCache } from './SettingsContext';
import { useAuth } from './AuthContext';
import {
  getUserSettings,
  updateUserSettings,
  createDefaultUserSettings,
  type UserSettings,
} from '../services/userSettings';
import type { User } from 'firebase/auth';
import { serverTimestamp, Timestamp } from 'firebase/firestore';

// Mock dependencies
vi.mock('./AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../services/userSettings', () => ({
  getUserSettings: vi.fn(),
  updateUserSettings: vi.fn(),
  createDefaultUserSettings: vi.fn(),
}));

describe('SettingsContext', () => {
  const mockUser: Partial<User> = {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
  };

  const mockSettings: UserSettings = {
    dateFormat: 'MM/DD/YYYY',
    theme: 'light',
    language: 'en',
    notifications: {
      email: true,
      budgetAlerts: true,
      monthlySummary: false,
    },
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <SettingsProvider>{children}</SettingsProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    clearSettingsCache(); // Clear cache before each test
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser as User,
      signOut: vi.fn(),
      signIn: vi.fn(),
      signUp: vi.fn(),
      resetPassword: vi.fn(),
      loading: false,
    });
  });

  describe('Initial State', () => {
    it('should provide initial settings state', () => {
      // Mock no authenticated user
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        signOut: vi.fn(),
        signIn: vi.fn(),
        signUp: vi.fn(),
        resetPassword: vi.fn(),
        loading: false,
      });

      const { result } = renderHook(() => useSettings(), { wrapper });

      expect(result.current).not.toBeNull();
      expect(result.current?.settings).toBeNull();
      expect(result.current?.loading).toBe(false);
      expect(result.current?.error).toBe('');
    });

    it('should provide updateSettings function', () => {
      const { result } = renderHook(() => useSettings(), { wrapper });

      expect(result.current).not.toBeNull();
      expect(result.current?.updateSettings).toBeDefined();
      expect(typeof result.current?.updateSettings).toBe('function');
    });

    it('should provide refreshSettings function', () => {
      const { result } = renderHook(() => useSettings(), { wrapper });

      expect(result.current).not.toBeNull();
      expect(result.current?.refreshSettings).toBeDefined();
      expect(typeof result.current?.refreshSettings).toBe('function');
    });
  });

  describe('Loading User Settings', () => {
    it('should load user settings when user is authenticated', async () => {
      vi.mocked(getUserSettings).mockResolvedValue(mockSettings);

      const { result } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current?.loading).toBe(false);
      });

      expect(getUserSettings).toHaveBeenCalledWith(mockUser.uid);
      expect(result.current?.settings).toEqual(mockSettings);
      expect(result.current?.error).toBe('');
    });

    it('should create default settings if none exist', async () => {
      // First call returns null (no settings), second call returns settings after creation
      vi.mocked(getUserSettings)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockSettings);
      vi.mocked(createDefaultUserSettings).mockResolvedValue();

      const { result } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current?.loading).toBe(false);
      });

      expect(getUserSettings).toHaveBeenCalledTimes(2);
      expect(getUserSettings).toHaveBeenCalledWith(mockUser.uid);
      expect(createDefaultUserSettings).toHaveBeenCalledWith(mockUser.uid);
      expect(result.current?.settings).toEqual(mockSettings);
      expect(result.current?.error).toBe('');
    });

    it('should handle loading errors gracefully', async () => {
      vi.mocked(getUserSettings).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current?.loading).toBe(false);
      });

      expect(result.current?.settings).toBeNull();
      expect(result.current?.error).toBe('Failed to load user settings: Network error');
    });

    it('should not load settings when user is not authenticated', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        signOut: vi.fn(),
        signIn: vi.fn(),
        signUp: vi.fn(),
        resetPassword: vi.fn(),
        loading: false,
      });

      const { result } = renderHook(() => useSettings(), { wrapper });

      expect(getUserSettings).not.toHaveBeenCalled();
      expect(result.current?.settings).toBeNull();
      expect(result.current?.loading).toBe(false);
    });

    it('should wait for auth loading to complete', async () => {
      // Start with auth loading
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        signOut: vi.fn(),
        signIn: vi.fn(),
        signUp: vi.fn(),
        resetPassword: vi.fn(),
        loading: true, // Auth is still loading
      });

      vi.mocked(getUserSettings).mockResolvedValue(mockSettings);

      const { result, rerender } = renderHook(() => useSettings(), { wrapper });

      // Settings should not be loaded while auth is loading
      expect(getUserSettings).not.toHaveBeenCalled();
      expect(result.current?.loading).toBe(true);

      // Auth loading completes with authenticated user
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser as User,
        signOut: vi.fn(),
        signIn: vi.fn(),
        signUp: vi.fn(),
        resetPassword: vi.fn(),
        loading: false,
      });

      rerender();

      await waitFor(() => {
        expect(result.current?.loading).toBe(false);
      });

      // Now settings should be loaded
      expect(getUserSettings).toHaveBeenCalledWith(mockUser.uid);
      expect(result.current?.settings).toEqual(mockSettings);
    });
  });

  describe('Updating Settings', () => {
    it('should update settings successfully', async () => {
      vi.mocked(getUserSettings).mockResolvedValue(mockSettings);
      vi.mocked(updateUserSettings).mockResolvedValue();

      const { result } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current?.loading).toBe(false);
      });

      // Initial settings loaded
      expect(result.current?.settings).toEqual(mockSettings);

      // Update theme setting
      const updatedTheme = { theme: 'dark' as const };
      await act(async () => {
        await result.current?.updateSettings(updatedTheme);
      });

      // Verify updateUserSettings was called with correct parameters
      expect(updateUserSettings).toHaveBeenCalledWith(mockUser.uid, updatedTheme);

      // Verify local state was updated
      expect(result.current?.settings).toEqual({
        ...mockSettings,
        ...updatedTheme,
      });

      // Verify no error
      expect(result.current?.error).toBe('');
    });

    it('should update local state optimistically', async () => {
      vi.mocked(getUserSettings).mockResolvedValue(mockSettings);

      // Mock updateUserSettings with a delay to simulate network latency
      let resolveUpdate: () => void;
      const updatePromise = new Promise<void>((resolve) => {
        resolveUpdate = resolve;
      });
      vi.mocked(updateUserSettings).mockReturnValue(updatePromise);

      const { result } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current?.loading).toBe(false);
      });

      // Initial settings loaded
      expect(result.current?.settings?.theme).toBe('light');

      // Update theme setting
      const updatedTheme = { theme: 'dark' as const };
      let updateCall: Promise<void>;
      await act(async () => {
        updateCall = result.current!.updateSettings(updatedTheme);
      });

      // Local state should be updated immediately (optimistically)
      expect(result.current?.settings?.theme).toBe('dark');

      // But the Firestore update hasn't completed yet
      expect(updateUserSettings).toHaveBeenCalledWith(mockUser.uid, updatedTheme);

      // Complete the Firestore update
      resolveUpdate!();
      await act(async () => {
        await updateCall!;
      });

      // State should still reflect the update
      expect(result.current?.settings?.theme).toBe('dark');
    });

    it('should revert optimistic update on error', async () => {
      vi.mocked(getUserSettings).mockResolvedValue(mockSettings);

      // Mock updateUserSettings to fail
      vi.mocked(updateUserSettings).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current?.loading).toBe(false);
      });

      // Initial settings loaded
      const originalSettings = result.current?.settings;
      expect(originalSettings?.theme).toBe('light');

      // Attempt to update theme setting
      const updatedTheme = { theme: 'dark' as const };

      await act(async () => {
        try {
          await result.current?.updateSettings(updatedTheme);
        } catch (err) {
          expect(err).toBeInstanceOf(Error);
          if (err instanceof Error) {
            expect(err.message).toBe('Network error');
          }
        }
      });

      // Verify updateUserSettings was called
      expect(updateUserSettings).toHaveBeenCalledWith(mockUser.uid, updatedTheme);

      // Local state should have reverted to original after error
      expect(result.current?.settings?.theme).toBe('light');
      expect(result.current?.settings).toEqual(originalSettings);

      // Error should be set in context with formatted message
      expect(result.current?.error).toBe('Failed to update settings: Network error');
    });

    it('should handle update errors gracefully', async () => {
      vi.mocked(getUserSettings).mockResolvedValue(mockSettings);

      // Mock updateUserSettings to fail
      vi.mocked(updateUserSettings).mockRejectedValue(new Error('Permission denied'));

      const { result } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current?.loading).toBe(false);
      });

      // Initial settings loaded with no error
      expect(result.current?.settings).toEqual(mockSettings);
      expect(result.current?.error).toBe('');

      // Attempt to update settings
      const updatedSettings = { dateFormat: 'DD/MM/YYYY' as const };

      let thrownError: Error | null = null;
      await act(async () => {
        try {
          await result.current?.updateSettings(updatedSettings);
        } catch (err) {
          thrownError = err as Error;
        }
      });

      // Error should be thrown with original message
      expect(thrownError).toBeInstanceOf(Error);
      expect(thrownError).not.toBeNull();
      expect(thrownError!.message).toBe('Permission denied');

      // Error state should be set with formatted message
      expect(result.current?.error).toBe('Failed to update settings: Permission denied');

      // App should not crash - context should still be accessible
      expect(result.current).not.toBeNull();
      expect(result.current?.updateSettings).toBeDefined();
      expect(result.current?.refreshSettings).toBeDefined();
    });

    it('should throw error if user is not authenticated', async () => {
      // Mock no authenticated user
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        signOut: vi.fn(),
        signIn: vi.fn(),
        signUp: vi.fn(),
        resetPassword: vi.fn(),
        loading: false,
      });

      const { result } = renderHook(() => useSettings(), { wrapper });

      // Attempt to update settings without authentication
      const updatedSettings = { theme: 'dark' as const };

      await act(async () => {
        await expect(
          result.current?.updateSettings(updatedSettings)
        ).rejects.toThrow('User must be authenticated to update settings');
      });

      // Verify updateUserSettings was never called
      expect(updateUserSettings).not.toHaveBeenCalled();
    });
  });

  describe('Refreshing Settings', () => {
    it('should refresh settings from Firestore', async () => {
      vi.mocked(getUserSettings).mockResolvedValueOnce(mockSettings);

      const { result } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current?.loading).toBe(false);
      });

      // Initial settings loaded
      expect(result.current?.settings).toEqual(mockSettings);
      expect(getUserSettings).toHaveBeenCalledTimes(1);

      // Mock updated settings from Firestore
      const updatedSettings: UserSettings = {
        ...mockSettings,
        theme: 'dark',
        dateFormat: 'DD/MM/YYYY',
      };
      vi.mocked(getUserSettings).mockResolvedValueOnce(updatedSettings);

      // Refresh settings
      await act(async () => {
        await result.current?.refreshSettings();
      });

      // Verify getUserSettings was called again
      expect(getUserSettings).toHaveBeenCalledTimes(2);
      expect(getUserSettings).toHaveBeenCalledWith(mockUser.uid);

      // Verify local state was updated with new settings
      expect(result.current?.settings).toEqual(updatedSettings);
      expect(result.current?.error).toBe('');
    });

    it('should handle refresh errors gracefully', async () => {
      vi.mocked(getUserSettings).mockResolvedValueOnce(mockSettings);

      const { result } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current?.loading).toBe(false);
      });

      // Initial settings loaded with no error
      expect(result.current?.settings).toEqual(mockSettings);
      expect(result.current?.error).toBe('');

      // Mock getUserSettings to fail on refresh
      vi.mocked(getUserSettings).mockRejectedValueOnce(new Error('Network error'));

      // Attempt to refresh settings
      await act(async () => {
        await result.current?.refreshSettings();
      });

      // Error state should be set with formatted message
      expect(result.current?.error).toBe('Failed to refresh settings: Network error');

      // App should not crash - context should still be accessible
      expect(result.current).not.toBeNull();
      expect(result.current?.updateSettings).toBeDefined();
      expect(result.current?.refreshSettings).toBeDefined();

      // Settings should remain as they were (not cleared)
      expect(result.current?.settings).toEqual(mockSettings);
    });

    it('should clear error on successful refresh', async () => {
      vi.mocked(getUserSettings)
        .mockResolvedValueOnce(mockSettings)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockSettings);

      const { result } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current?.loading).toBe(false);
      });

      // Initial settings loaded with no error
      expect(result.current?.settings).toEqual(mockSettings);
      expect(result.current?.error).toBe('');

      // Attempt to refresh settings - this will fail
      await act(async () => {
        await result.current?.refreshSettings();
      });

      // Error state should be set with formatted message
      expect(result.current?.error).toBe('Failed to refresh settings: Network error');

      // Refresh again - this time successfully
      await act(async () => {
        await result.current?.refreshSettings();
      });

      // Error should be cleared
      expect(result.current?.error).toBe('');
      expect(result.current?.settings).toEqual(mockSettings);
    });
  });

  describe('User Authentication Changes', () => {
    it('should reload settings when user logs in', async () => {
      // Start with no authenticated user
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        signOut: vi.fn(),
        signIn: vi.fn(),
        signUp: vi.fn(),
        resetPassword: vi.fn(),
        loading: false,
      });

      const { result, rerender } = renderHook(() => useSettings(), { wrapper });

      // No settings should be loaded
      expect(result.current?.settings).toBeNull();
      expect(getUserSettings).not.toHaveBeenCalled();

      // User logs in
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser as User,
        signOut: vi.fn(),
        signIn: vi.fn(),
        signUp: vi.fn(),
        resetPassword: vi.fn(),
        loading: false,
      });

      vi.mocked(getUserSettings).mockResolvedValue(mockSettings);

      rerender();

      await waitFor(() => {
        expect(result.current?.loading).toBe(false);
      });

      // Settings should be loaded for the authenticated user
      expect(getUserSettings).toHaveBeenCalledWith(mockUser.uid);
      expect(result.current?.settings).toEqual(mockSettings);
    });

    it('should clear settings when user logs out', async () => {
      vi.mocked(getUserSettings).mockResolvedValue(mockSettings);

      const { result, rerender } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current?.loading).toBe(false);
      });

      // Settings should be loaded
      expect(result.current?.settings).toEqual(mockSettings);

      // User logs out
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        signOut: vi.fn(),
        signIn: vi.fn(),
        signUp: vi.fn(),
        resetPassword: vi.fn(),
        loading: false,
      });

      rerender();

      // Settings should be cleared
      expect(result.current?.settings).toBeNull();
      expect(result.current?.error).toBe('');
      expect(result.current?.loading).toBe(false);
    });

    it('should load settings for different user on user change', async () => {
      const mockUser2: Partial<User> = {
        uid: 'test-user-456',
        email: 'test2@example.com',
        displayName: 'Test User 2',
      };

      const mockSettings2: UserSettings = {
        ...mockSettings,
        theme: 'dark',
        dateFormat: 'DD/MM/YYYY',
      };

      vi.mocked(getUserSettings).mockResolvedValueOnce(mockSettings);

      const { result, rerender } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current?.loading).toBe(false);
      });

      // First user's settings loaded
      expect(getUserSettings).toHaveBeenCalledWith(mockUser.uid);
      expect(result.current?.settings).toEqual(mockSettings);

      // Switch to different user
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser2 as User,
        signOut: vi.fn(),
        signIn: vi.fn(),
        signUp: vi.fn(),
        resetPassword: vi.fn(),
        loading: false,
      });

      vi.mocked(getUserSettings).mockResolvedValueOnce(mockSettings2);

      rerender();

      await waitFor(() => {
        expect(result.current?.loading).toBe(false);
      });

      // Second user's settings should be loaded
      expect(getUserSettings).toHaveBeenCalledWith(mockUser2.uid);
      expect(result.current?.settings).toEqual(mockSettings2);
    });
  });

  describe('Theme Application', () => {
    it('should apply theme class to body on settings load', async () => {
      vi.mocked(getUserSettings).mockResolvedValue(mockSettings);

      // Clear any existing theme classes
      document.body.className = '';

      const { result } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current?.loading).toBe(false);
      });

      // Settings loaded with light theme
      expect(result.current?.settings?.theme).toBe('light');

      // Theme class should be applied to body
      expect(document.body.classList.contains('theme-light')).toBe(true);
    });

    it('should update theme class when theme changes', async () => {
      vi.mocked(getUserSettings).mockResolvedValue(mockSettings);
      vi.mocked(updateUserSettings).mockResolvedValue();

      // Clear any existing theme classes
      document.body.className = '';

      const { result } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current?.loading).toBe(false);
      });

      // Initial theme applied
      expect(document.body.classList.contains('theme-light')).toBe(true);
      expect(document.body.classList.contains('theme-dark')).toBe(false);

      // Update theme to dark
      await act(async () => {
        await result.current?.updateSettings({ theme: 'dark' });
      });

      // Theme class should be updated
      expect(document.body.classList.contains('theme-dark')).toBe(true);
      expect(document.body.classList.contains('theme-light')).toBe(false);
    });

    it('should remove theme class when user logs out', async () => {
      vi.mocked(getUserSettings).mockResolvedValue(mockSettings);

      // Clear any existing theme classes
      document.body.className = '';

      const { result, rerender } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current?.loading).toBe(false);
      });

      // Theme class should be applied
      expect(document.body.classList.contains('theme-light')).toBe(true);

      // User logs out
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        signOut: vi.fn(),
        signIn: vi.fn(),
        signUp: vi.fn(),
        resetPassword: vi.fn(),
        loading: false,
      });

      rerender();

      // Theme class should be removed
      expect(document.body.classList.contains('theme-light')).toBe(false);
      expect(document.body.classList.contains('theme-dark')).toBe(false);
    });
  });

  describe('Error Context', () => {
    it('should throw error when useSettings is used outside provider', () => {
      expect(() => {
        renderHook(() => useSettings());
      }).toThrow('useSettings must be used within a SettingsProvider');
    });
  });

  describe('Concurrent Updates', () => {
    it('should handle multiple concurrent updates correctly', async () => {
      vi.mocked(getUserSettings).mockResolvedValue(mockSettings);
      vi.mocked(updateUserSettings).mockResolvedValue();

      const { result } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current?.loading).toBe(false);
      });

      // Perform multiple concurrent updates
      await act(async () => {
        await Promise.all([
          result.current?.updateSettings({ theme: 'dark' }),
          result.current?.updateSettings({ dateFormat: 'DD/MM/YYYY' }),
          result.current?.updateSettings({ notifications: { ...mockSettings.notifications, email: false } }),
        ]);
      });

      // All updates should be reflected in final state
      expect(result.current?.settings).toEqual({
        ...mockSettings,
        theme: 'dark',
        dateFormat: 'DD/MM/YYYY',
        notifications: { ...mockSettings.notifications, email: false },
      });

      // Each update should have been called
      expect(updateUserSettings).toHaveBeenCalledTimes(3);
    });

    it('should queue updates when one is in progress', async () => {
      vi.mocked(getUserSettings).mockResolvedValue(mockSettings);

      let resolveFirstUpdate: () => void;
      const firstUpdatePromise = new Promise<void>((resolve) => {
        resolveFirstUpdate = resolve;
      });

      vi.mocked(updateUserSettings)
        .mockReturnValueOnce(firstUpdatePromise)
        .mockResolvedValue();

      const { result } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current?.loading).toBe(false);
      });

      // Start first update (will be pending)
      let firstUpdate: Promise<void>;
      await act(async () => {
        firstUpdate = result.current!.updateSettings({ theme: 'dark' });
      });

      // Start second update while first is pending
      let secondUpdate: Promise<void>;
      await act(async () => {
        secondUpdate = result.current!.updateSettings({ dateFormat: 'DD/MM/YYYY' });
      });

      // Both updates should be reflected optimistically
      expect(result.current?.settings).toEqual({
        ...mockSettings,
        theme: 'dark',
        dateFormat: 'DD/MM/YYYY',
      });

      // Complete first update
      resolveFirstUpdate!();
      await act(async () => {
        await firstUpdate!;
        await secondUpdate!;
      });

      // Both updates should have been called
      expect(updateUserSettings).toHaveBeenCalledTimes(2);
      expect(updateUserSettings).toHaveBeenCalledWith(mockUser.uid, { theme: 'dark' });
      expect(updateUserSettings).toHaveBeenCalledWith(mockUser.uid, { dateFormat: 'DD/MM/YYYY' });
    });
  });

  describe('Settings Cache', () => {
    it('should cache settings after initial load', async () => {
      vi.mocked(getUserSettings).mockResolvedValue(mockSettings);

      // First provider instance - should fetch from Firestore
      const { unmount } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(vi.mocked(getUserSettings)).toHaveBeenCalledTimes(1);
      });

      unmount();

      // Second provider instance - should use cache, not fetch again
      const { result } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current?.loading).toBe(false);
      });

      // Settings should be loaded from cache
      expect(result.current?.settings).toEqual(mockSettings);
      // getUserSettings should still be called only once (from first mount)
      expect(getUserSettings).toHaveBeenCalledTimes(1);
    });

    it('should invalidate cache on manual refresh', async () => {
      vi.mocked(getUserSettings).mockResolvedValueOnce(mockSettings);

      const { result } = renderHook(() => useSettings(), { wrapper });

      await waitFor(() => {
        expect(result.current?.loading).toBe(false);
      });

      // Initial settings loaded
      expect(getUserSettings).toHaveBeenCalledTimes(1);
      expect(result.current?.settings).toEqual(mockSettings);

      // Mock different settings for refresh
      const updatedSettings: UserSettings = {
        ...mockSettings,
        theme: 'dark',
        dateFormat: 'DD/MM/YYYY',
      };
      vi.mocked(getUserSettings).mockResolvedValueOnce(updatedSettings);

      // Refresh settings - this should fetch from Firestore again
      await act(async () => {
        await result.current?.refreshSettings();
      });

      // Settings should be fetched again and updated
      expect(getUserSettings).toHaveBeenCalledTimes(2);
      expect(result.current?.settings).toEqual(updatedSettings);
    });
  });
});
