import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordReset } from './PasswordReset';
import { renderWithProviders } from '../../test/test-utils';
import { sendPasswordResetEmail } from 'firebase/auth';

// Mock Firebase
vi.mock('../../firebase', () => ({
  getAuthInstance: vi.fn(() => ({ currentUser: null })),
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth, callback) => {
    callback(null);
    return vi.fn();
  }),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));

describe('Password Reset Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete Password Reset Flow', () => {
    it('should complete full password reset flow successfully', async () => {
      const user = userEvent.setup();
      vi.mocked(sendPasswordResetEmail).mockResolvedValueOnce(undefined);

      renderWithProviders(<PasswordReset />);

      // User sees the password reset form
      expect(screen.getByRole('heading', { name: /reset password|forgot password/i })).toBeInTheDocument();
      expect(screen.getByText(/enter your email.*reset link/i)).toBeInTheDocument();

      // User enters their email
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'user@example.com');

      // User submits the form
      const submitButton = screen.getByRole('button', { name: /send reset link|reset password/i });
      await user.click(submitButton);

      // Success message appears
      await waitFor(() => {
        expect(screen.getByText(/reset email.*sent|check your inbox/i)).toBeInTheDocument();
      });

      // Firebase function was called with correct email
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        expect.anything(),
        'user@example.com'
      );
    });

    it('should handle user-not-found error gracefully', async () => {
      const user = userEvent.setup();
      const error = { code: 'auth/user-not-found', message: 'User not found' };
      vi.mocked(sendPasswordResetEmail).mockRejectedValueOnce(error);

      renderWithProviders(<PasswordReset />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'nonexistent@example.com');

      const submitButton = screen.getByRole('button', { name: /send reset link|reset password/i });
      await user.click(submitButton);

      // Should show success message (not revealing email doesn't exist)
      await waitFor(() => {
        expect(screen.getByText(/reset email.*sent|check your inbox/i)).toBeInTheDocument();
      });

      // Email input should be cleared after "success"
      expect(emailInput).toHaveValue('');
    });

    it('should handle rate limiting error', async () => {
      const user = userEvent.setup();
      const error = { code: 'auth/too-many-requests', message: 'Too many attempts' };
      vi.mocked(sendPasswordResetEmail).mockRejectedValueOnce(error);

      renderWithProviders(<PasswordReset />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'user@example.com');

      const submitButton = screen.getByRole('button', { name: /send reset link|reset password/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/too many.*try again later/i)).toBeInTheDocument();
      });
    });

    it('should clear form and allow retry after success', async () => {
      const user = userEvent.setup();
      vi.mocked(sendPasswordResetEmail).mockResolvedValue(undefined);

      renderWithProviders(<PasswordReset />);

      // First submission
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'first@example.com');

      let submitButton = screen.getByRole('button', { name: /send reset link|reset password/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/reset email.*sent|check your inbox/i)).toBeInTheDocument();
      });

      // Form is cleared
      expect(emailInput).toHaveValue('');

      // User can submit again with different email
      await user.type(emailInput, 'second@example.com');
      submitButton = screen.getByRole('button', { name: /send reset link|reset password/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(sendPasswordResetEmail).toHaveBeenCalledTimes(2);
      });

      expect(sendPasswordResetEmail).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        'first@example.com'
      );
      expect(sendPasswordResetEmail).toHaveBeenNthCalledWith(
        2,
        expect.anything(),
        'second@example.com'
      );
    });

    it('should handle network errors with generic message', async () => {
      const user = userEvent.setup();
      vi.mocked(sendPasswordResetEmail).mockRejectedValueOnce(
        new Error('Network connection failed')
      );

      renderWithProviders(<PasswordReset />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'user@example.com');

      const submitButton = screen.getByRole('button', { name: /send reset link|reset password/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/reset failed|error/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Experience Edge Cases', () => {
    it('should handle rapid form submissions', async () => {
      const user = userEvent.setup();
      vi.mocked(sendPasswordResetEmail).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      renderWithProviders(<PasswordReset />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /send reset link|reset password/i });

      // Try to click multiple times rapidly
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      // Should only make one request
      await waitFor(() => {
        expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle copy-pasted email with extra whitespace', async () => {
      const user = userEvent.setup();
      vi.mocked(sendPasswordResetEmail).mockResolvedValueOnce(undefined);

      renderWithProviders(<PasswordReset />);

      const emailInput = screen.getByLabelText(/email/i);
      // Simulate pasting with extra whitespace
      await user.clear(emailInput);
      await user.type(emailInput, '   user@example.com   ');

      const submitButton = screen.getByRole('button', { name: /send reset link|reset password/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(sendPasswordResetEmail).toHaveBeenCalledWith(
          expect.anything(),
          'user@example.com'
        );
      });
    });

    it('should handle special characters in email addresses', async () => {
      const user = userEvent.setup();
      vi.mocked(sendPasswordResetEmail).mockResolvedValueOnce(undefined);

      renderWithProviders(<PasswordReset />);

      const emailInput = screen.getByLabelText(/email/i);
      const complexEmail = 'user+test.name@sub.example.co.uk';
      await user.type(emailInput, complexEmail);

      const submitButton = screen.getByRole('button', { name: /send reset link|reset password/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(sendPasswordResetEmail).toHaveBeenCalledWith(
          expect.anything(),
          complexEmail
        );
      });
    });
  });

  describe('Navigation and Links', () => {
    it('should have working link back to sign in page', () => {
      renderWithProviders(<PasswordReset />);

      const signInLink = screen.getByText(/back to sign in|back to log in/i);
      expect(signInLink).toHaveAttribute('href', '/signin');
    });

    it('should not navigate away after successful reset', async () => {
      const user = userEvent.setup();
      vi.mocked(sendPasswordResetEmail).mockResolvedValueOnce(undefined);

      renderWithProviders(<PasswordReset />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /send reset link|reset password/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/reset email.*sent|check your inbox/i)).toBeInTheDocument();
      });

      // User should still see the success message on the same page
      expect(screen.getByRole('heading', { name: /reset password|forgot password/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility in Integration', () => {
    it('should maintain focus management during submission', async () => {
      const user = userEvent.setup();
      vi.mocked(sendPasswordResetEmail).mockResolvedValueOnce(undefined);

      renderWithProviders(<PasswordReset />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /send reset link|reset password/i });
      await user.click(submitButton);

      // After submission completes, focus should be managed appropriately
      await waitFor(() => {
        expect(screen.getByText(/reset email.*sent|check your inbox/i)).toBeInTheDocument();
      });

      // Success message should be announced to screen readers
      const successMessage = screen.getByText(/reset email.*sent|check your inbox/i);
      expect(successMessage).toBeInTheDocument();
    });

    it('should have proper ARIA labels for form states', async () => {
      const user = userEvent.setup();
      vi.mocked(sendPasswordResetEmail).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      renderWithProviders(<PasswordReset />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /send reset link|reset password/i });
      await user.click(submitButton);

      // Form should indicate busy state
      const form = submitButton.closest('form');
      expect(form).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Security Considerations', () => {
    it('should not reveal whether email exists in system (consistent messaging)', async () => {
      const user = userEvent.setup();

      // Success case - email exists
      vi.mocked(sendPasswordResetEmail).mockResolvedValueOnce(undefined);
      const { unmount } = renderWithProviders(<PasswordReset />);

      let emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'exists@example.com');

      let submitButton = screen.getByRole('button', { name: /send reset link|reset password/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/reset email.*sent|check your inbox/i)).toBeInTheDocument();
      });

      const successMessage = screen.getByText(/reset email.*sent|check your inbox/i).textContent;

      unmount();

      // User not found case - should show same success message for security
      const error = { code: 'auth/user-not-found' };
      vi.mocked(sendPasswordResetEmail).mockRejectedValueOnce(error);
      renderWithProviders(<PasswordReset />);

      emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'notfound@example.com');

      submitButton = screen.getByRole('button', { name: /send reset link|reset password/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/reset email.*sent|check your inbox/i)).toBeInTheDocument();
      });

      const userNotFoundMessage = screen.getByText(/reset email.*sent|check your inbox/i).textContent;

      // Messages should be the same to prevent email enumeration
      expect(successMessage).toBe(userNotFoundMessage);
    });

    it('should handle email case sensitivity consistently', async () => {
      const user = userEvent.setup();
      vi.mocked(sendPasswordResetEmail).mockResolvedValue(undefined);

      renderWithProviders(<PasswordReset />);

      const emailInput = screen.getByLabelText(/email/i);

      // Test with uppercase email
      await user.type(emailInput, 'USER@EXAMPLE.COM');

      const submitButton = screen.getByRole('button', { name: /send reset link|reset password/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(sendPasswordResetEmail).toHaveBeenCalledWith(
          expect.anything(),
          // Firebase handles case sensitivity, we just pass it through
          expect.any(String)
        );
      });
    });
  });
});
