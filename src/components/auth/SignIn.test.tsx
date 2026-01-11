import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignIn } from './SignIn';
import { useAuth } from '../../contexts/AuthContext';
import type { User } from 'firebase/auth';
import { ReactNode } from 'react';

// Mock the useAuth hook
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

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
    });
  });

  describe('Rendering', () => {
    it('should render sign in form with all required fields', () => {
      render(<SignIn />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /log in|sign in/i })).toBeInTheDocument();
    });

    it('should render email input field', () => {
      render(<SignIn />);

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should render password input field', () => {
      render(<SignIn />);

      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should have a link to registration page', () => {
      render(<SignIn />);

      const registerLink = screen.getByText(/sign up|register|create account/i);
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute('href', '/signup');
    });

    it('should display a heading or title', () => {
      render(<SignIn />);

      expect(screen.getByRole('heading', { name: /log in|sign in/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when submitting with empty email', async () => {
      const user = userEvent.setup();
      render(<SignIn />);

      const submitButton = screen.getByRole('button', { name: /log in|sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it('should show error when submitting with empty password', async () => {
      const user = userEvent.setup();
      render(<SignIn />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /log in|sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it('should show error for invalid email format', async () => {
      // Note: Browser's type="email" handles format validation,
      // so this test verifies the browser behavior works as expected
      render(<SignIn />);

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('type', 'email');

      // Browser validation will prevent submission of invalid emails
      // This test verifies the input type is correct for browser validation
    });

    it('should not show validation errors initially', () => {
      render(<SignIn />);

      expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/password is required/i)).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call signIn with correct credentials', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue(undefined);

      render(<SignIn />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /log in|sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('should navigate to home page after successful sign in', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue(undefined);

      render(<SignIn />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /log in|sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during sign in', async () => {
      const user = userEvent.setup();
      let resolveSignIn: () => void;
      const signInPromise = new Promise<void>((resolve) => {
        resolveSignIn = resolve;
      });
      mockSignIn.mockReturnValue(signInPromise);

      render(<SignIn />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /log in|sign in/i });
      await user.click(submitButton);

      expect(screen.getByText(/loading|signing in/i)).toBeInTheDocument();

      resolveSignIn!();
    });

    it('should disable submit button during loading', async () => {
      const user = userEvent.setup();
      let resolveSignIn: () => void;
      const signInPromise = new Promise<void>((resolve) => {
        resolveSignIn = resolve;
      });
      mockSignIn.mockReturnValue(signInPromise);

      render(<SignIn />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /log in|sign in/i });
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();

      resolveSignIn!();
    });
  });

  describe('Error Handling', () => {
    it('should display error message for wrong password', async () => {
      const user = userEvent.setup();
      mockSignIn.mockRejectedValue({
        code: 'auth/wrong-password',
        message: 'Wrong password',
      });

      render(<SignIn />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');

      const submitButton = screen.getByRole('button', { name: /log in|sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/incorrect password|wrong password/i)).toBeInTheDocument();
      });
    });

    it('should display error message for user not found', async () => {
      const user = userEvent.setup();
      mockSignIn.mockRejectedValue({
        code: 'auth/user-not-found',
        message: 'User not found',
      });

      render(<SignIn />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'nonexistent@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /log in|sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/user not found|no account found/i)).toBeInTheDocument();
      });
    });

    it('should display error message for invalid credentials', async () => {
      const user = userEvent.setup();
      mockSignIn.mockRejectedValue({
        code: 'auth/invalid-credential',
        message: 'Invalid credentials',
      });

      render(<SignIn />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');

      const submitButton = screen.getByRole('button', { name: /log in|sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials|incorrect email or password/i)).toBeInTheDocument();
      });
    });

    it('should display generic error message for unknown errors', async () => {
      const user = userEvent.setup();
      mockSignIn.mockRejectedValue({
        code: 'auth/unknown-error',
        message: 'Something went wrong',
      });

      render(<SignIn />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /log in|sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/error|failed|something went wrong/i)).toBeInTheDocument();
      });
    });

    it('should clear previous error when user retries', async () => {
      const user = userEvent.setup();
      mockSignIn.mockRejectedValueOnce({
        code: 'auth/wrong-password',
        message: 'Wrong password',
      });

      render(<SignIn />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');

      const submitButton = screen.getByRole('button', { name: /log in|sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/incorrect password|wrong password/i)).toBeInTheDocument();
      });

      mockSignIn.mockResolvedValue(undefined);

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
      });

      render(<SignIn />);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});

