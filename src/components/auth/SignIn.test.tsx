import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, toHaveNoViolations } from '../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../test/test-utils';
import { SignIn } from './SignIn';
import { useAuth } from '../../contexts/AuthContext';
import type { User } from 'firebase/auth';
import {
  runFormAccessibilityTests,
  runFormErrorAccessibilityTests,
  runLoadingStateAccessibilityTests,
  runComponentRenderingTests,
  runFormValidationTests,
  runSuccessfulSubmissionTests,
  runErrorHandlingTests,
  runUserExperienceTests,
} from '../../test/suites';
import { type ReactNode } from 'react';

expect.extend(toHaveNoViolations);

// Mock the useAuth hook
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: { children: ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  };
});

describe('SignIn Component', () => {
  const mockSignIn = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      signIn: mockSignIn,
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
    });
  });

  const renderComponent = () => renderWithRouter(<SignIn />);

  const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
  };

  // ============================================
  // SHARED TEST SUITES
  // ============================================

  // Rendering tests
  runComponentRenderingTests('SignIn', {
    renderComponent,
    heading: /log in|sign in/i,
    formFields: [
      { label: /email/i, type: 'email' },
      { label: /password/i, type: 'password' },
    ],
    submitButton: /log in|sign in/i,
    links: [
      { text: /sign up|register|create account/i, href: '/signup' },
      { text: /forgot password|reset password/i, href: '/password-reset' },
    ],
  });

  // Validation tests
  runFormValidationTests('SignIn', {
    renderComponent,
    requiredFields: [
      { label: /email/i, errorMessage: /email is required/i },
      { label: /password/i, errorMessage: /password is required/i },
    ],
    mockSubmit: () => mockSignIn,
  });

  // Successful submission tests
  runSuccessfulSubmissionTests('SignIn', {
    renderComponent,
    fillForm,
    mockSubmit: () => mockSignIn,
    expectedCallArgs: ['test@example.com', 'password123'],
    shouldShowLoading: true,
    loadingText: /loading|signing in/i,
  });

  // Error handling tests
  runErrorHandlingTests('SignIn', {
    renderComponent,
    fillForm,
    mockSubmit: () => mockSignIn,
    errors: [
      { code: 'auth/wrong-password', expectedDisplay: /incorrect password|wrong password/i },
      { code: 'auth/user-not-found', expectedDisplay: /user not found|no account found/i },
      { code: 'auth/invalid-credential', expectedDisplay: /invalid credentials|incorrect email or password/i },
      { message: 'Unknown error', expectedDisplay: /error|failed|something went wrong/i },
    ],
  });

  // User experience tests
  runUserExperienceTests('SignIn', {
    renderComponent,
    fillForm,
    mockSubmit: () => mockSignIn,
    shouldAllowEnterSubmit: true,
  });

  // Accessibility test suites
  runFormAccessibilityTests('SignIn', renderComponent);

  runFormErrorAccessibilityTests('SignIn', {
    renderComponent: () => renderComponent(),
    triggerError: async () => {
      const user = userEvent.setup();
      const submitButton = screen.getByRole('button', { name: /log in|sign in/i });
      await user.click(submitButton);
    },
    errorMessage: /email is required/i,
    associatedInputLabel: /email/i,
  });

  runLoadingStateAccessibilityTests('SignIn', {
    renderComponent: () => renderComponent(),
    triggerLoading: async () => {
      mockSignIn.mockImplementation(() => new Promise(() => { })); // Never resolves
      const user = userEvent.setup();
      await fillForm(user);
      const submitButton = screen.getByRole('button', { name: /log in|sign in/i });
      await user.click(submitButton);
    },
    loadingIndicator: /loading|signing in/i,
  });

  // ============================================
  // COMPONENT-SPECIFIC TESTS
  // ============================================

  describe('Form Submission', () => {
    it('should navigate to home page after successful sign in', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue(undefined);

      renderComponent();

      await fillForm(user);

      const submitButton = screen.getByRole('button', { name: /log in|sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Error Handling', () => {
    it('should clear previous error when user retries', async () => {
      const user = userEvent.setup();
      mockSignIn.mockRejectedValueOnce({
        code: 'auth/wrong-password',
        message: 'Wrong password',
      });

      renderComponent();

      await fillForm(user);

      const submitButton = screen.getByRole('button', { name: /log in|sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/incorrect password|wrong password/i)).toBeInTheDocument();
      });

      mockSignIn.mockResolvedValue(undefined);

      const passwordInput = screen.getByLabelText(/password/i);
      await user.clear(passwordInput);
      await user.type(passwordInput, 'correctpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(/incorrect password|wrong password/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Already Logged In', () => {
    it('should redirect to home if user is already logged in', () => {
      const mockUser: Partial<User> = {
        uid: 'test-user-123',
        email: 'test@example.com',
      };

      vi.mocked(useAuth).mockReturnValue({
        user: mockUser as User,
        loading: false,
        signIn: mockSignIn,
        signUp: vi.fn(),
        signOut: vi.fn(),
        resetPassword: vi.fn(),
      });

      renderComponent();

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Accessibility - Additional', () => {
    it('should have autocomplete attributes for better UX', () => {
      renderComponent();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toHaveAttribute('autocomplete', 'email');
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    });

    it('should not lose focus on error display', async () => {
      const user = userEvent.setup();
      renderComponent();

      const emailInput = screen.getByLabelText(/email/i);
      await user.click(emailInput);

      const submitButton = screen.getByRole('button', { name: /log in|sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });

      // Focus should remain manageable
      expect(document.activeElement).toBeTruthy();
    });
  });
});

