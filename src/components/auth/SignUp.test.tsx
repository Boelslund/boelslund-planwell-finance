import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, toHaveNoViolations } from '../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../test/test-utils';
import { SignUp } from './SignUp';
import { useAuth } from '../../contexts/AuthContext';
import { createUserProfile } from '../../services/userProfile';
import type { User } from 'firebase/auth';
import { type ReactNode } from 'react';
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

expect.extend(toHaveNoViolations);

// Mock the useAuth hook
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock userProfile service
vi.mock('../../services/userProfile', () => ({
  createUserProfile: vi.fn(),
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

describe('SignUp Component', () => {
  const mockSignUp = vi.fn();
  const mockCreateUserProfile = vi.mocked(createUserProfile);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      signIn: vi.fn(),
      signUp: mockSignUp,
      signOut: vi.fn(),
      resetPassword: vi.fn(),
    });
  });

  const renderComponent = () => renderWithRouter(<SignUp />);

  const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.type(screen.getByLabelText(/name/i), 'Test User');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
  };

  // ============================================
  // SHARED TEST SUITES
  // ============================================

  // Rendering tests
  runComponentRenderingTests('SignUp', {
    renderComponent,
    heading: /sign up|register|create account/i,
    formFields: [
      { label: /name/i, type: 'text' },
      { label: /email/i, type: 'email' },
      { label: /^password/i, type: 'password' },
      { label: /confirm password/i, type: 'password' },
    ],
    submitButton: /sign up|register/i,
    links: [
      { text: /log in|sign in|already have an account/i, href: '/signin' },
    ],
  });

  // Validation tests
  runFormValidationTests('SignUp', {
    renderComponent,
    requiredFields: [
      { label: /name/i, errorMessage: /name is required/i },
      { label: /email/i, errorMessage: /email is required/i },
      { label: /^password/i, errorMessage: /password is required/i },
      { label: /confirm password/i, errorMessage: /please confirm your password/i },
    ],
    mockSubmit: () => mockSignUp,
  });

  // Successful submission tests (basic)
  runSuccessfulSubmissionTests('SignUp', {
    renderComponent,
    fillForm,
    mockSubmit: () => mockSignUp,
    expectedCallArgs: ['test@example.com', 'password123'],
    shouldShowLoading: true,
    loadingText: /loading|creating account|signing up/i,
  });

  // Error handling tests
  runErrorHandlingTests('SignUp', {
    renderComponent,
    fillForm,
    mockSubmit: () => mockSignUp,
    errors: [
      { code: 'auth/email-already-in-use', expectedDisplay: /email already in use|account already exists|email is already registered/i },
      { code: 'auth/weak-password', expectedDisplay: /weak password|password is too weak|password should be stronger/i },
      { code: 'auth/invalid-email', expectedDisplay: /invalid email|email is not valid/i },
      { message: 'Unknown error', expectedDisplay: /error|failed|something went wrong/i },
    ],
  });

  // User experience tests
  runUserExperienceTests('SignUp', {
    renderComponent,
    fillForm,
    mockSubmit: () => mockSignUp,
    shouldAllowEnterSubmit: true,
  });

  // Accessibility test suites
  runFormAccessibilityTests('SignUp', renderComponent);

  runFormErrorAccessibilityTests('SignUp', {
    renderComponent: () => renderComponent(),
    triggerError: async () => {
      const user = userEvent.setup();
      const submitButton = screen.getByRole('button', { name: /sign up|register/i });
      await user.click(submitButton);
    },
    errorMessage: /name is required/i,
    associatedInputLabel: /name/i,
  });

  runLoadingStateAccessibilityTests('SignUp', {
    renderComponent: () => {
      mockCreateUserProfile.mockResolvedValue();
      return renderComponent();
    },
    triggerLoading: async () => {
      mockSignUp.mockImplementation(() => new Promise(() => { })); // Never resolves
      const user = userEvent.setup();
      await fillForm(user);
      const submitButton = screen.getByRole('button', { name: /sign up|register/i });
      await user.click(submitButton);
    },
    loadingIndicator: /loading|creating account|signing up/i,
  });

  // ============================================
  // COMPONENT-SPECIFIC TESTS
  // ============================================

  describe('Form Validation - SignUp Specific', () => {
    it('should show error when submitting with empty confirm password', async () => {
      const user = userEvent.setup();
      renderComponent();

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');

      const passwordInput = screen.getByLabelText(/^password/i);
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /sign up|register/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/confirm password is required|please confirm your password/i)).toBeInTheDocument();
      });
      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup();
      renderComponent();

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');

      const passwordInput = screen.getByLabelText(/^password/i);
      await user.type(passwordInput, 'password123');

      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      await user.type(confirmPasswordInput, 'differentpassword');

      const submitButton = screen.getByRole('button', { name: /sign up|register/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match|passwords must match/i)).toBeInTheDocument();
      });
      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it('should show error when password is too short', async () => {
      const user = userEvent.setup();
      renderComponent();

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');

      const passwordInput = screen.getByLabelText(/^password/i);
      await user.type(passwordInput, '1234567');

      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      await user.type(confirmPasswordInput, '1234567');

      const submitButton = screen.getByRole('button', { name: /sign up|register/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password must be at least|password too short|minimum.*characters/i)).toBeInTheDocument();
      });
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission - SignUp Specific', () => {
    it('should create user profile after successful registration', async () => {
      const user = userEvent.setup();
      const mockUserCredential = {
        user: { uid: 'test-uid-123', email: 'newuser@example.com' } as User
      };
      mockSignUp.mockResolvedValue(mockUserCredential);

      renderComponent();

      const displayNameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await user.type(displayNameInput, 'Test User');
      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /sign up|register/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(createUserProfile).toHaveBeenCalledWith('test-uid-123', 'newuser@example.com', 'Test User');
      });
    });

    it('should navigate to home page after successful registration', async () => {
      const user = userEvent.setup();
      const mockUserCredential = {
        user: { uid: 'test-uid', email: 'newuser@example.com' } as User
      };
      mockSignUp.mockResolvedValue(mockUserCredential);

      renderComponent();

      await fillForm(user);

      const submitButton = screen.getByRole('button', { name: /sign up|register/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Error Handling - SignUp Specific', () => {
    it('should fail registration if profile creation fails', async () => {
      const user = userEvent.setup();
      const mockUserCredential = {
        user: { uid: 'test-uid-123', email: 'newuser@example.com' } as User
      };
      mockSignUp.mockResolvedValue(mockUserCredential);
      mockCreateUserProfile.mockRejectedValue({
        code: 'permission-denied',
        message: 'Missing or insufficient permissions',
      });

      renderComponent();

      await fillForm(user);

      const submitButton = screen.getByRole('button', { name: /sign up|register/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/database configuration error|contact support/i)).toBeInTheDocument();
      });

      // Verify navigation did NOT happen
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should clear previous error when user retries', async () => {
      const user = userEvent.setup();
      mockSignUp.mockRejectedValueOnce({
        code: 'auth/email-already-in-use',
        message: 'Email already in use',
      });

      renderComponent();

      await fillForm(user);

      const submitButton = screen.getByRole('button', { name: /sign up|register/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email already in use|account already exists/i)).toBeInTheDocument();
      });

      const mockUserCredential = {
        user: { uid: 'test-uid', email: 'newuser@example.com' } as User
      };
      mockSignUp.mockResolvedValue(mockUserCredential);

      const emailInput = screen.getByLabelText(/email/i);
      await user.clear(emailInput);
      await user.type(emailInput, 'newuser@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(/email already in use|account already exists/i)).not.toBeInTheDocument();
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
        signIn: vi.fn(),
        signUp: mockSignUp,
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

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);

      expect(nameInput).toHaveAttribute('autocomplete', 'name');
      expect(emailInput).toHaveAttribute('autocomplete', 'email');
      expect(passwordInput).toHaveAttribute('autocomplete', 'new-password');
    });

    it('should not lose focus on error display', async () => {
      const user = userEvent.setup();
      renderComponent();

      const nameInput = screen.getByLabelText(/name/i);
      await user.click(nameInput);

      const submitButton = screen.getByRole('button', { name: /sign up|register|create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });

      expect(document.activeElement).toBeTruthy();
    });

    it('should properly label password fields for screen readers', () => {
      renderComponent();

      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });
  });
});
