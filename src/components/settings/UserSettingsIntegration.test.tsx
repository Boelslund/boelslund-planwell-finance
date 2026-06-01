import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { SettingsProvider, clearSettingsCache } from '../../contexts/SettingsContext';
import { UserSettings } from '../../components/settings/UserSettings';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Home } from '../../pages/Home';
import { SignIn } from '../../components/auth/SignIn';
import {
  getUserSettings,
  updateUserSettings,
  createDefaultUserSettings,
} from '../../services/userSettings';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import type { Timestamp } from 'firebase/firestore';
import type { UserSettings as UserSettingsType } from '../../services/userSettings';

// Mock Firebase services
vi.mock('../../services/userSettings', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/userSettings')>();
  return {
    ...actual,
    getUserSettings: vi.fn(),
    updateUserSettings: vi.fn(),
    createDefaultUserSettings: vi.fn(),
  };
});

vi.mock('../../firebase', () => ({
  getAuthInstance: vi.fn(() => ({})),
  getDbInstance: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth, callback) => {
    callback(null);
    return vi.fn();
  }),
  signOut: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));

describe('User Settings Integration Tests', () => {
  const mockUser: Partial<User> = {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    emailVerified: true,
  };

  const mockSettings: UserSettingsType = {
    dateFormat: 'MM/DD/YYYY',
    theme: 'light',
    language: 'en',
    notifications: {
      email: false,
      budgetAlerts: false,
      monthlySummary: false,
    },
    createdAt: null as unknown as Timestamp,
    updatedAt: null as unknown as Timestamp,
  };

  const renderUserSettings = () => {
    return render(
      <MemoryRouter initialEntries={['/profile']}>
        <AuthProvider>
          <SettingsProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signin" element={<SignIn />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute redirectTo="/">
                    <UserSettings />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </SettingsProvider>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    clearSettingsCache(); // Clear settings cache between tests
    document.body.className = ''; // Clear body classes

    // Mock authenticated user by default
    vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
      (callback as (user: User | null) => void)(mockUser as User);
      return vi.fn();
    });
  });

  afterEach(() => {
    document.body.className = ''; // Clean up
  });

  describe('AuthContext + SettingsContext Integration', () => {
    it('should redirect to home page when not authenticated', () => {
      vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
        (callback as (user: User | null) => void)(null);
        return vi.fn();
      });

      renderUserSettings();

      // Should redirect to home page via ProtectedRoute
      expect(screen.getByText('Welcome to PlanWell Finance!')).toBeInTheDocument();
      expect(screen.queryByLabelText(/date format/i)).not.toBeInTheDocument();
    });

    it('should load settings from service through SettingsContext when authenticated', async () => {
      vi.mocked(getUserSettings).mockResolvedValue(mockSettings);

      renderUserSettings();

      await waitFor(() => {
        expect(getUserSettings).toHaveBeenCalledWith('test-user-123');
      });

      await waitFor(() => {
        expect(screen.getByLabelText(/date format/i)).toBeInTheDocument();
      });
    });

    it('should clear settings and theme when user signs out', async () => {
      vi.mocked(getUserSettings).mockResolvedValue(mockSettings);

      let authCallback: (user: User | null) => void;

      vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
        authCallback = callback as (user: User | null) => void;
        (callback as (user: User | null) => void)(mockUser as User);
        return vi.fn();
      });

      renderUserSettings();

      await waitFor(() => {
        expect(document.body.classList.contains('theme-light')).toBe(true);
      });

      // Simulate sign out
      authCallback!(null);

      await waitFor(() => {
        expect(screen.getByText('Welcome to PlanWell Finance!')).toBeInTheDocument();
      });

      expect(document.body.className).toBe('');
    });

    it('should load new settings when user switches accounts', async () => {
      let authCallback: (user: User | null) => void;

      vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
        authCallback = callback as (user: User | null) => void;
        (callback as (user: User | null) => void)(mockUser as User);
        return vi.fn();
      });

      vi.mocked(getUserSettings).mockResolvedValue(mockSettings);

      renderUserSettings();

      await waitFor(() => {
        expect(screen.getByLabelText(/date format/i)).toBeInTheDocument();
      });

      // Switch to different user
      const differentUser = { ...mockUser, uid: 'different-user-456' };
      const differentSettings = { ...mockSettings, theme: 'dark' as const };
      vi.mocked(getUserSettings).mockResolvedValue(differentSettings);

      authCallback!(differentUser as User);

      await waitFor(() => {
        expect(getUserSettings).toHaveBeenCalledWith('different-user-456');
      });

      await waitFor(() => {
        expect(document.body.classList.contains('theme-dark')).toBe(true);
      });
    });
  });

  describe('Theme Integration with Document', () => {
    it('should apply theme from SettingsContext to document.body', async () => {
      vi.mocked(getUserSettings).mockResolvedValue(mockSettings);

      renderUserSettings();

      await waitFor(() => {
        expect(document.body.classList.contains('theme-light')).toBe(true);
      });
    });

    it('should update document.body theme when settings change', async () => {
      const user = userEvent.setup();
      vi.mocked(getUserSettings).mockResolvedValue(mockSettings);
      vi.mocked(updateUserSettings).mockResolvedValue(undefined);

      renderUserSettings();

      await waitFor(() => {
        expect(document.body.classList.contains('theme-light')).toBe(true);
      });

      const themeSelect = screen.getByLabelText(/theme/i);
      await user.selectOptions(themeSelect, 'dark');

      const submitButton = screen.getByRole('button', { name: /update settings/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(updateUserSettings).toHaveBeenCalledWith('test-user-123', expect.objectContaining({
          theme: 'dark',
        }));
      });

      // Theme should update after successful save
      await waitFor(() => {
        expect(document.body.classList.contains('theme-dark')).toBe(true);
        expect(document.body.classList.contains('theme-light')).toBe(false);
      });
    });

    it('should remove theme class when user signs out', async () => {
      vi.mocked(getUserSettings).mockResolvedValue({
        ...mockSettings,
        theme: 'dark',
      });

      let authCallback: (user: User | null) => void;

      vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
        authCallback = callback as (user: User | null) => void;
        (callback as (user: User | null) => void)(mockUser as User);
        return vi.fn();
      });

      renderUserSettings();

      await waitFor(() => {
        expect(document.body.classList.contains('theme-dark')).toBe(true);
      });

      // Sign out
      authCallback!(null);

      await waitFor(() => {
        expect(document.body.className).toBe('');
      });
    });
  });

  describe('Service Layer Integration', () => {
    it('should create default settings for new users through service', async () => {
      vi.mocked(getUserSettings).mockResolvedValueOnce(null);
      vi.mocked(createDefaultUserSettings).mockResolvedValue(undefined);
      vi.mocked(getUserSettings).mockResolvedValueOnce(mockSettings);

      renderUserSettings();

      await waitFor(() => {
        expect(createDefaultUserSettings).toHaveBeenCalledWith('test-user-123');
      });

      await waitFor(() => {
        expect(getUserSettings).toHaveBeenCalledTimes(2);
      });
    });

    it('should propagate service errors through SettingsContext', async () => {
      vi.mocked(getUserSettings).mockRejectedValue(new Error('Network error'));

      renderUserSettings();

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should allow retry after service error', async () => {
      const user = userEvent.setup();
      vi.mocked(getUserSettings).mockRejectedValueOnce(new Error('Network error'));
      vi.mocked(getUserSettings).mockResolvedValueOnce(mockSettings);

      renderUserSettings();

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/date format/i)).toBeInTheDocument();
      });
    });

    it('should handle default settings creation failure', async () => {
      vi.mocked(getUserSettings).mockResolvedValueOnce(null);
      vi.mocked(createDefaultUserSettings).mockRejectedValue(
        new Error('Firestore permission denied')
      );

      renderUserSettings();

      await waitFor(() => {
        expect(screen.getByText(/Firestore permission denied/i)).toBeInTheDocument();
      });
    });

    it('should update settings through SettingsContext.updateSettings', async () => {
      const user = userEvent.setup();
      vi.mocked(getUserSettings).mockResolvedValue(mockSettings);
      vi.mocked(updateUserSettings).mockResolvedValue(undefined);

      renderUserSettings();

      await waitFor(() => {
        expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
      });

      const themeSelect = screen.getByLabelText(/theme/i);
      await user.selectOptions(themeSelect, 'dark');

      const submitButton = screen.getByRole('button', { name: /update settings/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(updateUserSettings).toHaveBeenCalledWith(
          'test-user-123',
          expect.objectContaining({ theme: 'dark' })
        );
      });
    });

    it('should display save errors from service through context', async () => {
      const user = userEvent.setup();
      vi.mocked(getUserSettings).mockResolvedValue(mockSettings);
      vi.mocked(updateUserSettings).mockRejectedValue(
        new Error('Permission denied')
      );

      renderUserSettings();

      await waitFor(() => {
        expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
      });

      const themeSelect = screen.getByLabelText(/theme/i);
      await user.selectOptions(themeSelect, 'dark');

      const submitButton = screen.getByRole('button', { name: /update settings/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Permission denied/i)).toBeInTheDocument();
      });
    });
  });

  describe('Context Caching and Persistence', () => {
    it('should use SettingsContext cache across remounts', async () => {
      vi.mocked(getUserSettings).mockResolvedValue(mockSettings);

      const { unmount } = renderUserSettings();

      await waitFor(() => {
        expect(screen.getByLabelText(/date format/i)).toBeInTheDocument();
      });

      // First mount called getUserSettings once
      expect(getUserSettings).toHaveBeenCalledTimes(1);

      unmount();

      // Re-mount - should use cached settings, not call getUserSettings again
      renderUserSettings();

      await waitFor(() => {
        expect(screen.getByLabelText(/date format/i)).toBeInTheDocument();
      });

      // Should still be only 1 call because cache was used on second mount
      expect(getUserSettings).toHaveBeenCalledTimes(1);
    });

    it('should maintain theme consistency when SettingsContext updates', async () => {
      const user = userEvent.setup();
      vi.mocked(getUserSettings).mockResolvedValue(mockSettings);

      // Mock updateUserSettings to also update the settings returned by context
      const updatedSettings = { ...mockSettings, theme: 'dark' as const };
      vi.mocked(updateUserSettings).mockImplementation(async () => {
        vi.mocked(getUserSettings).mockResolvedValue(updatedSettings);
      });

      renderUserSettings();

      await waitFor(() => {
        expect(document.body.classList.contains('theme-light')).toBe(true);
      });

      const themeSelect = screen.getByLabelText(/theme/i);
      await user.selectOptions(themeSelect, 'dark');

      const submitButton = screen.getByRole('button', { name: /update settings/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(document.body.classList.contains('theme-dark')).toBe(true);
      });
    });
  });
});
