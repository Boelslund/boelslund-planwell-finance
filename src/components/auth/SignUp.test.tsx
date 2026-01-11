import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignUp } from './SignUp';
import { useAuth } from '../../contexts/AuthContext';
import { createUserProfile } from '../../services/userProfile';
import type { User } from 'firebase/auth';
import { ReactNode } from 'react';

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
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: { children: ReactNode; to: string }) => (
        <a href={to}>{children}</a>
    ),
}));

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
        });
    });

    describe('Rendering', () => {
        it('should render registration form with all required fields', () => {
            render(<SignUp />);

            expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /sign up|register/i })).toBeInTheDocument();
        });

        it('should render email input field with correct type', () => {
            render(<SignUp />);

            const emailInput = screen.getByLabelText(/email/i);
            expect(emailInput).toHaveAttribute('type', 'email');
        });

        it('should render password input fields with correct type', () => {
            render(<SignUp />);

            const passwordInput = screen.getByLabelText(/^password/i);
            const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

            expect(passwordInput).toHaveAttribute('type', 'password');
            expect(confirmPasswordInput).toHaveAttribute('type', 'password');
        });

        it('should have a link to login page', () => {
            render(<SignUp />);

            const loginLink = screen.getByText(/log in|sign in|already have an account/i);
            expect(loginLink).toBeInTheDocument();
            expect(loginLink).toHaveAttribute('href', '/signin');
        });

        it('should display a heading or title', () => {
            render(<SignUp />);

            expect(screen.getByRole('heading', { name: /sign up|register|create account/i })).toBeInTheDocument();
        });
    });

    describe('Form Validation', () => {
        it('should show error when submitting with empty name', async () => {
            const user = userEvent.setup();
            render(<SignUp />);

            const submitButton = screen.getByRole('button', { name: /sign up|register/i });
            await user.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/name is required/i)).toBeInTheDocument();
            });
            expect(mockSignUp).not.toHaveBeenCalled();
        });

        it('should show error when submitting with empty email', async () => {
            const user = userEvent.setup();
            render(<SignUp />);

            const submitButton = screen.getByRole('button', { name: /sign up|register/i });
            await user.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/email is required/i)).toBeInTheDocument();
            });
            expect(mockSignUp).not.toHaveBeenCalled();
        });

        it('should show error when submitting with empty password', async () => {
            const user = userEvent.setup();
            render(<SignUp />);

            const emailInput = screen.getByLabelText(/email/i);
            await user.type(emailInput, 'test@example.com');

            const submitButton = screen.getByRole('button', { name: /sign up|register/i });
            await user.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/password is required/i)).toBeInTheDocument();
            });
            expect(mockSignUp).not.toHaveBeenCalled();
        });

        it('should show error when submitting with empty confirm password', async () => {
            const user = userEvent.setup();
            render(<SignUp />);

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
            render(<SignUp />);

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
            render(<SignUp />);

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

        it('should not show validation errors initially', () => {
            render(<SignUp />);

            expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/password is required/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument();
        });
    });

    describe('Form Submission', () => {
        it('should call signUp with correct credentials', async () => {
            const user = userEvent.setup();
            const mockUserCredential = {
                user: { uid: 'test-uid', email: 'newuser@example.com' } as User
            };
            mockSignUp.mockResolvedValue(mockUserCredential);

            render(<SignUp />);

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
                expect(mockSignUp).toHaveBeenCalledWith('newuser@example.com', 'password123');
            });
        });

        it('should create user profile after successful registration', async () => {
            const user = userEvent.setup();
            const { createUserProfile } = await import('../../services/userProfile');
            const mockUserCredential = {
                user: { uid: 'test-uid-123', email: 'newuser@example.com' } as User
            };
            mockSignUp.mockResolvedValue(mockUserCredential);

            render(<SignUp />);

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

            render(<SignUp />);

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
                expect(mockNavigate).toHaveBeenCalledWith('/');
            });
        });

    });

    describe('Loading States', () => {
        it('should show loading state during sign up', async () => {
            const user = userEvent.setup();
            let resolveSignUp: (value: { user: User }) => void;
            const signUpPromise = new Promise<{ user: User }>((resolve) => {
                resolveSignUp = resolve;
            });
            mockSignUp.mockReturnValue(signUpPromise);

            render(<SignUp />);

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

            expect(screen.getByText(/loading|creating account|signing up/i)).toBeInTheDocument();

            resolveSignUp!({
                user: { uid: 'test-uid', email: 'newuser@example.com' } as User
            });
        });

        it('should disable submit button during loading', async () => {
            const user = userEvent.setup();
            let resolveSignUp: (value: { user: User }) => void;
            const signUpPromise = new Promise<{ user: User }>((resolve) => {
                resolveSignUp = resolve;
            });
            mockSignUp.mockReturnValue(signUpPromise);

            render(<SignUp />);

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

            expect(submitButton).toBeDisabled();

            resolveSignUp!({
                user: { uid: 'test-uid', email: 'newuser@example.com' } as User
            });
        });
    });

    describe('Error Handling', () => {
        it('should display error message for email already in use', async () => {
            const user = userEvent.setup();
            mockSignUp.mockRejectedValue({
                code: 'auth/email-already-in-use',
                message: 'Email already in use',
            });

            render(<SignUp />);

            const displayNameInput = screen.getByLabelText(/name/i);
            const emailInput = screen.getByLabelText(/email/i);
            const passwordInput = screen.getByLabelText(/^password/i);
            const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

            await user.type(displayNameInput, 'Test User');
            await user.type(emailInput, 'existing@example.com');
            await user.type(passwordInput, 'password123');
            await user.type(confirmPasswordInput, 'password123');

            const submitButton = screen.getByRole('button', { name: /sign up|register/i });
            await user.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/email already in use|account already exists|email is already registered/i)).toBeInTheDocument();
            });
        });

        it('should display error message for weak password', async () => {
            const user = userEvent.setup();
            mockSignUp.mockRejectedValue({
                code: 'auth/weak-password',
                message: 'Weak password',
            });

            render(<SignUp />);

            const displayNameInput = screen.getByLabelText(/name/i);
            const emailInput = screen.getByLabelText(/email/i);
            const passwordInput = screen.getByLabelText(/^password/i);
            const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

            await user.type(displayNameInput, 'Test User');
            await user.type(emailInput, 'newuser@example.com');
            await user.type(passwordInput, 'weakpass');
            await user.type(confirmPasswordInput, 'weakpass');

            const submitButton = screen.getByRole('button', { name: /sign up|register/i });
            await user.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/weak password|password is too weak|password should be stronger/i)).toBeInTheDocument();
            });
        });

        it('should display error message for invalid email', async () => {
            const user = userEvent.setup();
            mockSignUp.mockRejectedValue({
                code: 'auth/invalid-email',
                message: 'Invalid email',
            });

            render(<SignUp />);

            const displayNameInput = screen.getByLabelText(/name/i);
            const emailInput = screen.getByLabelText(/email/i);
            const passwordInput = screen.getByLabelText(/^password/i);
            const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

            await user.type(displayNameInput, 'Test User');
            await user.type(emailInput, 'invalid@email');
            await user.type(passwordInput, 'password123');
            await user.type(confirmPasswordInput, 'password123');

            const submitButton = screen.getByRole('button', { name: /sign up|register/i });
            await user.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/invalid email|email is not valid/i)).toBeInTheDocument();
            });
        });

        it('should display generic error message for unknown errors', async () => {
            const user = userEvent.setup();
            mockSignUp.mockRejectedValue({
                code: 'auth/unknown-error',
                message: 'Something went wrong',
            });

            render(<SignUp />);

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
                expect(screen.getByText(/error|failed|something went wrong/i)).toBeInTheDocument();
            });
        });

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

            render(<SignUp />);

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

            render(<SignUp />);

            const displayNameInput = screen.getByLabelText(/name/i);
            const emailInput = screen.getByLabelText(/email/i);
            const passwordInput = screen.getByLabelText(/^password/i);
            const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

            await user.type(displayNameInput, 'Test User');
            await user.type(emailInput, 'existing@example.com');
            await user.type(passwordInput, 'password123');
            await user.type(confirmPasswordInput, 'password123');

            const submitButton = screen.getByRole('button', { name: /sign up|register/i });
            await user.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/email already in use|account already exists/i)).toBeInTheDocument();
            });

            const mockUserCredential = {
                user: { uid: 'test-uid', email: 'newuser@example.com' } as User
            };
            mockSignUp.mockResolvedValue(mockUserCredential);

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
            });

            render(<SignUp />);

            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });
});


