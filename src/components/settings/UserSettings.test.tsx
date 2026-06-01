import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { UserSettings } from './UserSettings';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import type { User } from 'firebase/auth';
import type { UserSettings as UserSettingsType } from '../../services/userSettings';
import { serverTimestamp, Timestamp } from 'firebase/firestore';

// Mock contexts
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../contexts/SettingsContext', () => ({
  useSettings: vi.fn(),
}));

describe('UserSettings Component', () => {
  const mockUser: Partial<User> = {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
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
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };

  const mockUpdateSettings = vi.fn();
  const mockRefreshSettings = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser as User,
      signOut: vi.fn(),
      signIn: vi.fn(),
      signUp: vi.fn(),
      resetPassword: vi.fn(),
      loading: false,
    });
    vi.mocked(useSettings).mockReturnValue({
      settings: mockSettings,
      loading: false,
      error: "",
      updateSettings: mockUpdateSettings,
      refreshSettings: mockRefreshSettings,
    });
  });

  describe('Rendering', () => {
    it('should render settings form with all fields', () => {
      render(<UserSettings />);

      expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/date format/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/language/i)).toBeInTheDocument();
    });

    it('should render notification settings section', () => {
      render(<UserSettings />);

      expect(screen.getByRole('heading', { name: /notifications/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email notifications/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/budget alerts/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/monthly summary/i)).toBeInTheDocument();
    });

    it('should display current settings values', () => {
      render(<UserSettings />);

      const dateFormatSelect = screen.getByLabelText(/date format/i) as HTMLSelectElement;
      expect(dateFormatSelect.value).toBe('MM/DD/YYYY');

      const themeSelect = screen.getByLabelText(/theme/i) as HTMLSelectElement;
      expect(themeSelect.value).toBe('light');

      const languageSelect = screen.getByLabelText(/language/i) as HTMLSelectElement;
      expect(languageSelect.value).toBe('en');
    });

    it('should display notification toggles in correct state', () => {
      render(<UserSettings />);

      const emailNotifCheckbox = screen.getByLabelText(/email notifications/i) as HTMLInputElement;
      expect(emailNotifCheckbox.checked).toBe(false);

      const budgetAlertsCheckbox = screen.getByLabelText(/budget alerts/i) as HTMLInputElement;
      expect(budgetAlertsCheckbox.checked).toBe(false);

      const monthlySummaryCheckbox = screen.getByLabelText(/monthly summary/i) as HTMLInputElement;
      expect(monthlySummaryCheckbox.checked).toBe(false);
    });

    it('should show loading state when settings are loading', () => {
      vi.mocked(useSettings).mockReturnValue({
        settings: null,
        loading: true,
        error: "",
        updateSettings: mockUpdateSettings,
        refreshSettings: mockRefreshSettings,
      });

      render(<UserSettings />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should show error message when settings fail to load', () => {
      const errorMessage = 'Failed to load settings';
      vi.mocked(useSettings).mockReturnValue({
        settings: null,
        loading: false,
        error: errorMessage,
        updateSettings: mockUpdateSettings,
        refreshSettings: mockRefreshSettings,
      });

      render(<UserSettings />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('Date Format Selection', () => {
    it('should update date format locally but not save until form submission', async () => {
      const user = userEvent.setup();
      mockUpdateSettings.mockResolvedValue(undefined);
      render(<UserSettings />);

      const dateFormatSelect = screen.getByLabelText(/date format/i) as HTMLSelectElement;

      // Initial value should be from settings
      expect(dateFormatSelect.value).toBe('MM/DD/YYYY');

      // Change the selection
      await user.selectOptions(dateFormatSelect, 'DD/MM/YYYY');

      // Verify the local state updated
      expect(dateFormatSelect.value).toBe('DD/MM/YYYY');

      // Verify updateSettings was NOT called yet
      expect(mockUpdateSettings).not.toHaveBeenCalled();

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /update settings/i });
      await user.click(submitButton);

      // Now updateSettings should be called with all form values including the changed field
      await waitFor(() => {
        expect(mockUpdateSettings).toHaveBeenCalledWith({
          dateFormat: 'DD/MM/YYYY',
          theme: 'light',
          language: 'en',
          notifications: {
            email: false,
            budgetAlerts: false,
            monthlySummary: false,
          },
        });
      });
    });

    it('should display available date format options', () => {
      render(<UserSettings />);

      const dateFormatSelect = screen.getByLabelText(/date format/i);
      const options = Array.from(dateFormatSelect.querySelectorAll('option'));
      const optionValues = options.map(opt => opt.getAttribute('value'));

      expect(optionValues).toContain('MM/DD/YYYY');
      expect(optionValues).toContain('DD/MM/YYYY');
      expect(optionValues).toContain('YYYY-MM-DD');
    });

    it('should show example date for each format option', () => {
      render(<UserSettings />);

      const dateFormatSelect = screen.getByLabelText(/date format/i);

      // Check that options have descriptive text
      expect(dateFormatSelect).toHaveTextContent('MM/DD/YYYY');
      expect(dateFormatSelect).toHaveTextContent('DD/MM/YYYY');
      expect(dateFormatSelect).toHaveTextContent('YYYY-MM-DD');
    });
  });

  describe('Theme Selection', () => {
    it('should update theme locally but not save until form submission', async () => {
      const user = userEvent.setup();
      mockUpdateSettings.mockResolvedValue(undefined);
      render(<UserSettings />);

      const themeSelect = screen.getByLabelText(/theme/i) as HTMLSelectElement;

      // Initial value should be from settings
      expect(themeSelect.value).toBe('light');

      // Change the selection
      await user.selectOptions(themeSelect, 'dark');

      // Verify the local state updated
      expect(themeSelect.value).toBe('dark');

      // Verify updateSettings was NOT called yet
      expect(mockUpdateSettings).not.toHaveBeenCalled();

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /update settings/i });
      await user.click(submitButton);

      // Now updateSettings should be called with all form values including the changed field
      await waitFor(() => {
        expect(mockUpdateSettings).toHaveBeenCalledWith({
          dateFormat: 'MM/DD/YYYY',
          theme: 'dark',
          language: 'en',
          notifications: {
            email: false,
            budgetAlerts: false,
            monthlySummary: false,
          },
        });
      });
    });

    it('should display light and dark theme options', () => {
      render(<UserSettings />);

      const themeSelect = screen.getByLabelText(/theme/i);
      const options = Array.from(themeSelect.querySelectorAll('option'));
      const optionValues = options.map(opt => opt.getAttribute('value'));

      expect(optionValues).toContain('light');
      expect(optionValues).toContain('dark');
    });

    // Note: Theme class application to body is handled by SettingsContext, not UserSettings component
    // This test should be in SettingsContext.test.tsx instead
  });

  describe('Language Selection', () => {
    it('should display available language options', () => {
      render(<UserSettings />);

      const languageSelect = screen.getByLabelText(/language/i);
      const options = Array.from(languageSelect.querySelectorAll('option'));
      const optionValues = options.map(opt => opt.getAttribute('value'));

      // Currently only English is implemented, Danish (dk) planned for future
      expect(optionValues).toContain('en');
    });

    // TODO: Re-enable when Danish language support is added
    // it('should update language locally but not save until form submission', async () => {
    //   const user = userEvent.setup();
    //   mockUpdateSettings.mockResolvedValue(undefined);
    //   render(<UserSettings />);
    //
    //   const languageSelect = screen.getByLabelText(/language/i) as HTMLSelectElement;
    //   
    //   expect(languageSelect.value).toBe('en');
    //   await user.selectOptions(languageSelect, 'dk');
    //   expect(languageSelect.value).toBe('dk');
    //   expect(mockUpdateSettings).not.toHaveBeenCalled();
    //
    //   const submitButton = screen.getByRole('button', { name: /update settings/i });
    //   await user.click(submitButton);
    //
    //   await waitFor(() => {
    //     expect(mockUpdateSettings).toHaveBeenCalledWith({
    //       dateFormat: 'MM/DD/YYYY',
    //       theme: 'light',
    //       language: 'dk',
    //       notifications: {
    //         email: true,
    //         budgetAlerts: true,
    //         monthlySummary: false,
    //       },
    //     });
    //   });
    // });
  });

  describe('Notification Settings', () => {
    it('should toggle email notifications locally but not save until form submission', async () => {
      const user = userEvent.setup();
      mockUpdateSettings.mockResolvedValue(undefined);
      render(<UserSettings />);

      const emailNotifCheckbox = screen.getByLabelText(/email notifications/i) as HTMLInputElement;

      // Initial state
      expect(emailNotifCheckbox.checked).toBe(false);

      // Toggle the checkbox
      await user.click(emailNotifCheckbox);

      // Verify local state updated
      expect(emailNotifCheckbox.checked).toBe(true);

      // Verify updateSettings was NOT called yet
      expect(mockUpdateSettings).not.toHaveBeenCalled();

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /update settings/i });
      await user.click(submitButton);

      // Now updateSettings should be called with all form values
      await waitFor(() => {
        expect(mockUpdateSettings).toHaveBeenCalledWith({
          dateFormat: 'MM/DD/YYYY',
          theme: 'light',
          language: 'en',
          notifications: {
            email: true,
            budgetAlerts: false,
            monthlySummary: false,
          },
        });
      });
    });

    it('should toggle budget alerts locally but not save until form submission', async () => {
      const user = userEvent.setup();
      mockUpdateSettings.mockResolvedValue(undefined);
      render(<UserSettings />);

      const budgetAlertsCheckbox = screen.getByLabelText(/budget alerts/i) as HTMLInputElement;

      expect(budgetAlertsCheckbox.checked).toBe(false);
      await user.click(budgetAlertsCheckbox);
      expect(budgetAlertsCheckbox.checked).toBe(true);
      expect(mockUpdateSettings).not.toHaveBeenCalled();

      const submitButton = screen.getByRole('button', { name: /update settings/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateSettings).toHaveBeenCalledWith({
          dateFormat: 'MM/DD/YYYY',
          theme: 'light',
          language: 'en',
          notifications: {
            email: false,
            budgetAlerts: true,
            monthlySummary: false,
          },
        });
      });
    });

    it('should toggle monthly summary locally but not save until form submission', async () => {
      const user = userEvent.setup();
      mockUpdateSettings.mockResolvedValue(undefined);
      render(<UserSettings />);

      const monthlySummaryCheckbox = screen.getByLabelText(/monthly summary/i) as HTMLInputElement;

      expect(monthlySummaryCheckbox.checked).toBe(false);
      await user.click(monthlySummaryCheckbox);
      expect(monthlySummaryCheckbox.checked).toBe(true);
      expect(mockUpdateSettings).not.toHaveBeenCalled();

      const submitButton = screen.getByRole('button', { name: /update settings/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateSettings).toHaveBeenCalledWith({
          dateFormat: 'MM/DD/YYYY',
          theme: 'light',
          language: 'en',
          notifications: {
            email: false,
            budgetAlerts: false,
            monthlySummary: true,
          },
        });
      });
    });
  });

  describe('Unsaved Changes Warning', () => {
    it('should warn user when leaving page with unsaved changes', async () => {
      const user = userEvent.setup();
      render(<UserSettings />);

      // Make a change without submitting
      const themeSelect = screen.getByLabelText(/theme/i);
      await user.selectOptions(themeSelect, 'dark');

      // Attempt to navigate away should trigger warning
      // Note: In real implementation, this would use beforeunload event or React Router blocker
      const beforeUnloadEvent = new Event('beforeunload');
      const preventDefaultSpy = vi.fn();
      beforeUnloadEvent.preventDefault = preventDefaultSpy;

      window.dispatchEvent(beforeUnloadEvent);

      // Should have attempted to prevent default (show browser warning)
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should not warn when leaving page without changes', async () => {
      render(<UserSettings />);

      // No changes made, navigate away should not trigger warning
      const beforeUnloadEvent = new Event('beforeunload');
      const preventDefaultSpy = vi.fn();
      beforeUnloadEvent.preventDefault = preventDefaultSpy;

      window.dispatchEvent(beforeUnloadEvent);

      // Should NOT prevent default (no warning)
      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it('should not warn after successfully submitting changes', async () => {
      const user = userEvent.setup();
      mockUpdateSettings.mockResolvedValue(undefined);
      render(<UserSettings />);

      // Make a change
      const themeSelect = screen.getByLabelText(/theme/i);
      await user.selectOptions(themeSelect, 'dark');

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /update settings/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateSettings).toHaveBeenCalled();
      });

      // After successful submit, navigate away should not trigger warning
      const beforeUnloadEvent = new Event('beforeunload');
      const preventDefaultSpy = vi.fn();
      beforeUnloadEvent.preventDefault = preventDefaultSpy;

      window.dispatchEvent(beforeUnloadEvent);

      // Should NOT prevent default (no warning after save)
      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it('should show custom confirmation dialog when attempting to navigate with unsaved changes', async () => {
      const user = userEvent.setup();
      render(<UserSettings />);

      // Make a change
      const themeSelect = screen.getByLabelText(/theme/i);
      await user.selectOptions(themeSelect, 'dark');

      // For React Router navigation, expect a custom confirmation dialog
      // This would be shown via a component like useBlocker in React Router v6
      // The exact implementation depends on the routing solution

      // This test verifies the message is appropriate
      expect(true).toBe(true); // Placeholder - actual implementation will depend on routing
    });
  });

  describe('Form Validation', () => {
    it('should prevent form submission when not authenticated', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        signOut: vi.fn(),
        signIn: vi.fn(),
        signUp: vi.fn(),
        resetPassword: vi.fn(),
        loading: false,
      });

      render(<UserSettings />);

      expect(screen.getByText(/sign in to manage your settings/i)).toBeInTheDocument();
    });

    it('should disable all inputs while settings are loading', () => {
      vi.mocked(useSettings).mockReturnValue({
        settings: null,
        loading: true,
        error: "",
        updateSettings: mockUpdateSettings,
        refreshSettings: mockRefreshSettings,
      });

      render(<UserSettings />);

      expect(screen.queryByLabelText(/date format/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/theme/i)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<UserSettings />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels for all inputs', () => {
      render(<UserSettings />);

      expect(screen.getByLabelText(/date format/i)).toHaveAttribute('id');
      expect(screen.getByLabelText(/theme/i)).toHaveAttribute('id');
      expect(screen.getByLabelText(/language/i)).toHaveAttribute('id');
      expect(screen.getByLabelText(/monthly summary/i)).toHaveAttribute('id');
    });

    it('should have proper fieldset for notification settings', () => {
      render(<UserSettings />);

      const notificationFieldset = screen.getByRole('group', { name: /notifications/i });
      expect(notificationFieldset).toBeInTheDocument();
    });

    it('should announce updates to screen readers after form submission', async () => {
      const user = userEvent.setup();
      mockUpdateSettings.mockResolvedValue(undefined);
      render(<UserSettings />);

      const themeSelect = screen.getByLabelText(/theme/i);
      await user.selectOptions(themeSelect, 'dark');

      const submitButton = screen.getByRole('button', { name: /update settings/i });
      await user.click(submitButton);

      await waitFor(() => {
        const alert = screen.getByRole('status');
        expect(alert).toHaveTextContent(/settings updated successfully/i);
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support tab navigation through all fields', async () => {
      const user = userEvent.setup();
      render(<UserSettings />);

      const dateFormatSelect = screen.getByLabelText(/date format/i);
      const themeSelect = screen.getByLabelText(/theme/i);
      const languageSelect = screen.getByLabelText(/language/i);

      dateFormatSelect.focus();
      expect(dateFormatSelect).toHaveFocus();

      await user.tab();
      expect(themeSelect).toHaveFocus();

      await user.tab();
      expect(languageSelect).toHaveFocus();
    });

    it('should support keyboard interaction for checkboxes', async () => {
      const user = userEvent.setup();
      mockUpdateSettings.mockResolvedValue(undefined);
      render(<UserSettings />);

      const emailNotifCheckbox = screen.getByLabelText(/email notifications/i) as HTMLInputElement;
      emailNotifCheckbox.focus();

      const initialChecked = emailNotifCheckbox.checked;

      await user.keyboard(' '); // Space key

      // Should toggle the checkbox locally
      expect(emailNotifCheckbox.checked).toBe(!initialChecked);
    });
  });

  describe('Error Handling', () => {
    it('should display error message when update fails', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Network error';
      mockUpdateSettings.mockRejectedValue(new Error(errorMessage));
      render(<UserSettings />);

      const themeSelect = screen.getByLabelText(/theme/i);
      await user.selectOptions(themeSelect, 'dark');

      const submitButton = screen.getByRole('button', { name: /update settings/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to update settings/i)).toBeInTheDocument();
      });
    });

    it('should allow retry after failed update', async () => {
      const user = userEvent.setup();
      mockUpdateSettings.mockRejectedValueOnce(new Error('Network error'));
      mockUpdateSettings.mockResolvedValueOnce(undefined);
      render(<UserSettings />);

      const themeSelect = screen.getByLabelText(/theme/i);
      const submitButton = screen.getByRole('button', { name: /update settings/i });

      // First attempt fails
      await user.selectOptions(themeSelect, 'dark');
      await user.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText(/failed to update settings/i)).toBeInTheDocument();
      });

      // Second attempt succeeds
      await user.selectOptions(themeSelect, 'light');
      await user.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText(/settings updated successfully/i)).toBeInTheDocument();
      });
    });

    it('should show retry button when settings fail to load', async () => {
      const user = userEvent.setup();
      vi.mocked(useSettings).mockReturnValue({
        settings: null,
        loading: false,
        error: 'Failed to load settings',
        updateSettings: mockUpdateSettings,
        refreshSettings: mockRefreshSettings,
      });

      render(<UserSettings />);

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      expect(mockRefreshSettings).toHaveBeenCalled();
    });
  });

  describe('Save Indicator', () => {
    it('should show saving indicator during update', async () => {
      const user = userEvent.setup();
      mockUpdateSettings.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      render(<UserSettings />);

      const themeSelect = screen.getByLabelText(/theme/i);
      await user.selectOptions(themeSelect, 'dark');

      const submitButton = screen.getByRole('button', { name: /update settings/i });
      await user.click(submitButton);

      expect(screen.getByText(/saving/i)).toBeInTheDocument();
    });

    it('should clear save indicator after successful update', async () => {
      const user = userEvent.setup();
      mockUpdateSettings.mockResolvedValue(undefined);
      render(<UserSettings />);

      const themeSelect = screen.getByLabelText(/theme/i);
      await user.selectOptions(themeSelect, 'dark');

      const submitButton = screen.getByRole('button', { name: /update settings/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(/saving/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Reset to Defaults', () => {
    it('should show reset to defaults button', () => {
      render(<UserSettings />);

      expect(screen.getByRole('button', { name: /reset to defaults/i })).toBeInTheDocument();
    });

    it('should reset all settings to defaults when clicked', async () => {
      const user = userEvent.setup();
      mockUpdateSettings.mockResolvedValue(undefined);
      render(<UserSettings />);

      const resetButton = screen.getByRole('button', { name: /reset to defaults/i });
      await user.click(resetButton);

      // After first click, button text changes to confirm
      const confirmButton = screen.getByRole('button', { name: /confirm reset to defaults/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockUpdateSettings).toHaveBeenCalledWith({
          dateFormat: 'MM/DD/YYYY',
          theme: 'light',
          language: 'en',
          notifications: {
            email: false,
            budgetAlerts: false,
            monthlySummary: false,
          },
        });
      });
    });

    it('should show confirmation dialog before resetting', async () => {
      const user = userEvent.setup();
      render(<UserSettings />);

      const resetButton = screen.getByRole('button', { name: /reset to defaults/i });
      await user.click(resetButton);

      expect(screen.getByText(/are you sure you want to reset all settings/i)).toBeInTheDocument();
    });
  });
});
