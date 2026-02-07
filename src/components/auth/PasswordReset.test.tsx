import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the useAuth hook
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ to, children }: { to: string; children: ReactNode }) => (
      <a href={to}>{children}</a>
    ),
    useNavigate: () => vi.fn(),
  };
});

import { PasswordReset } from './PasswordReset';
import { useAuth } from '../../contexts/AuthContext';
import {
  renderWithRouter,
  screen,
  waitFor,
  userEvent,
  toHaveNoViolations,
} from '../../test/test-utils';
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
import { ReactNode } from 'react';

expect.extend(toHaveNoViolations);

describe('PasswordReset Component', () => {
  const mockResetPassword = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: mockResetPassword,
    });
  });

  const renderComponent = () => renderWithRouter(<PasswordReset />);

  const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
  };

  // ============================================
  // SHARED TEST SUITES - Covers most common tests
  // ============================================

  // Rendering tests
  runComponentRenderingTests('PasswordReset', {
    renderComponent,
    heading: /reset password|forgot password/i,
    formFields: [{ label: /email/i, type: 'email' }],
    submitButton: /send reset link|reset password/i,
    links: [{ text: /back to sign in|back to log in/i, href: '/signin' }],
    helperText: /enter your email.*reset link/i,
  });

  // Validation tests
  runFormValidationTests('PasswordReset', {
    renderComponent,
    requiredFields: [{ label: /email/i, errorMessage: /email is required/i }],
    mockSubmit: () => mockResetPassword,
  });

  // Successful submission tests
  runSuccessfulSubmissionTests('PasswordReset', {
    renderComponent,
    fillForm,
    mockSubmit: () => mockResetPassword,
    expectedCallArgs: ['test@example.com'],
    successMessages: [/check your inbox/i, /spam folder/i], // Check both parts
    shouldClearForm: true,
    shouldShowLoading: true,
    loadingText: /sending/i,
  });

  // Error handling tests
  runErrorHandlingTests('PasswordReset', {
    renderComponent,
    fillForm,
    mockSubmit: () => mockResetPassword,
    errors: [
      // Note: auth/user-not-found is intentionally not tested here as it shows success message for security
      { code: 'auth/invalid-email', expectedDisplay: /invalid email/i },
      { code: 'auth/too-many-requests', expectedDisplay: /too many.*try again later/i },
      { message: 'Network error', expectedDisplay: /reset failed|error/i },
    ],
  });

  // User experience tests
  runUserExperienceTests('PasswordReset', {
    renderComponent,
    fillForm,
    mockSubmit: () => mockResetPassword,
    focusOnMount: /email/i,
    shouldTrimWhitespace: { field: /email/i, expectedValue: 'test@example.com' },
    shouldAllowEnterSubmit: true,
  });

  // Accessibility test suites
  runFormAccessibilityTests('PasswordReset', renderComponent);

  runFormErrorAccessibilityTests('PasswordReset', {
    renderComponent: () => renderComponent(),
    triggerError: async () => {
      const user = userEvent.setup();
      const submitButton = screen.getByRole('button', { name: /send reset link|reset password/i });
      await user.click(submitButton);
    },
    errorMessage: /email is required/i,
    associatedInputLabel: /email/i,
  });

  runLoadingStateAccessibilityTests('PasswordReset', {
    renderComponent: () => renderComponent(),
    triggerLoading: async () => {
      mockResetPassword.mockImplementation(() => new Promise(() => { })); // Never resolves
      const user = userEvent.setup();
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');
      const submitButton = screen.getByRole('button', { name: /send reset link|reset password/i });
      await user.click(submitButton);
    },
    loadingIndicator: /sending/i,
  });

  // ============================================
  // COMPONENT-SPECIFIC TESTS
  // Only tests unique to PasswordReset component
  // ============================================

  describe('Component-Specific Behavior', () => {
    it('should clear error when user starts typing again', async () => {
      const user = userEvent.setup();
      mockResetPassword.mockRejectedValueOnce(new Error('Network error'));
      renderComponent();

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /send reset link|reset password/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/reset failed|error/i)).toBeInTheDocument();
      });

      await user.clear(emailInput);
      await user.type(emailInput, 'new@example.com');

      expect(screen.queryByText(/failed.*reset|error/i)).not.toBeInTheDocument();
    });

    it('should keep success message visible until user interacts', async () => {
      const user = userEvent.setup();
      mockResetPassword.mockResolvedValueOnce(undefined);
      renderComponent();

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /send reset link|reset password/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/check your inbox/i)).toBeInTheDocument();
      });

      // Success message should remain visible (check both parts)
      expect(screen.getByText(/check your inbox/i)).toBeInTheDocument();
      expect(screen.getByText(/spam folder/i)).toBeInTheDocument();
    });

    it('should clear success message when user types in email field', async () => {
      const user = userEvent.setup();
      mockResetPassword.mockResolvedValueOnce(undefined);
      renderComponent();

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /send reset link|reset password/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/check your inbox/i)).toBeInTheDocument();
      });

      // Type in the email field
      await user.type(emailInput, 'a');

      // Success message should be cleared (both parts)
      expect(screen.queryByText(/check your inbox/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/spam folder/i)).not.toBeInTheDocument();
    });
  });
});
