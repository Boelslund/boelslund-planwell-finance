import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import type { User } from 'firebase/auth';

// Mock the useAuth hook
vi.mock('../../contexts/AuthContext', () => ({
    useAuth: vi.fn(),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate">{to}</div>,
    useNavigate: () => mockNavigate,
}));

describe('ProtectedRoute Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Loading State', () => {
        it('should show loading indicator when authentication is being checked', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: null,
                loading: true,
                signIn: vi.fn(),
                signUp: vi.fn(),
                signOut: vi.fn(),
            });

            render(
                <ProtectedRoute>
                    <div>Protected Content</div>
                </ProtectedRoute>
            );

            expect(screen.getByText(/loading/i)).toBeInTheDocument();
            expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
        });

        it('should not show children during loading', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: null,
                loading: true,
                signIn: vi.fn(),
                signUp: vi.fn(),
                signOut: vi.fn(),
            });

            render(
                <ProtectedRoute>
                    <div>Secret Data</div>
                </ProtectedRoute>
            );

            expect(screen.queryByText('Secret Data')).not.toBeInTheDocument();
        });
    });

    describe('Unauthenticated Access', () => {
        it('should redirect to home page when user is not authenticated', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: null,
                loading: false,
                signIn: vi.fn(),
                signUp: vi.fn(),
                signOut: vi.fn(),
            });

            render(
                <ProtectedRoute>
                    <div>Protected Content</div>
                </ProtectedRoute>
            );

            expect(screen.getByTestId('navigate')).toHaveTextContent('/');
            expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
        });

        it('should not render children when user is not authenticated', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: null,
                loading: false,
                signIn: vi.fn(),
                signUp: vi.fn(),
                signOut: vi.fn(),
            });

            render(
                <ProtectedRoute>
                    <div data-testid="protected-content">Sensitive Information</div>
                </ProtectedRoute>
            );

            expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        });
    });

    describe('Authenticated Access', () => {
        const mockUser: Partial<User> = {
            uid: 'test-user-123',
            email: 'test@example.com',
            emailVerified: true,
        };

        it('should render children when user is authenticated', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: mockUser as User,
                loading: false,
                signIn: vi.fn(),
                signUp: vi.fn(),
                signOut: vi.fn(),
            });

            render(
                <ProtectedRoute>
                    <div>Protected Content</div>
                </ProtectedRoute>
            );

            expect(screen.getByText('Protected Content')).toBeInTheDocument();
        });

        it('should not show loading or redirect when user is authenticated', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: mockUser as User,
                loading: false,
                signIn: vi.fn(),
                signUp: vi.fn(),
                signOut: vi.fn(),
            });

            render(
                <ProtectedRoute>
                    <div>Dashboard</div>
                </ProtectedRoute>
            );

            expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
            expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
            expect(screen.getByText('Dashboard')).toBeInTheDocument();
        });

        it('should render multiple child elements when authenticated', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: mockUser as User,
                loading: false,
                signIn: vi.fn(),
                signUp: vi.fn(),
                signOut: vi.fn(),
            });

            render(
                <ProtectedRoute>
                    <h1>Dashboard</h1>
                    <p>Welcome back!</p>
                    <button>Logout</button>
                </ProtectedRoute>
            );

            expect(screen.getByText('Dashboard')).toBeInTheDocument();
            expect(screen.getByText('Welcome back!')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
        });
    });

    describe('Custom Redirect Path', () => {
        it('should redirect to custom path when provided', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: null,
                loading: false,
                signIn: vi.fn(),
                signUp: vi.fn(),
                signOut: vi.fn(),
            });

            render(
                <ProtectedRoute redirectTo="/custom-login">
                    <div>Protected Content</div>
                </ProtectedRoute>
            );

            expect(screen.getByTestId('navigate')).toHaveTextContent('/custom-login');
        });

        it('should use default /login path when no redirectTo prop is provided', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: null,
                loading: false,
                signIn: vi.fn(),
                signUp: vi.fn(),
                signOut: vi.fn(),
            });

            render(
                <ProtectedRoute>
                    <div>Protected Content</div>
                </ProtectedRoute>
            );

            expect(screen.getByTestId('navigate')).toHaveTextContent('/');
        });
    });

    describe('Edge Cases', () => {
        it('should handle transition from loading to authenticated', () => {
            const { rerender } = render(
                <ProtectedRoute>
                    <div>Protected Content</div>
                </ProtectedRoute>
            );

            // Initially loading
            vi.mocked(useAuth).mockReturnValue({
                user: null,
                loading: true,
                signIn: vi.fn(),
                signUp: vi.fn(),
                signOut: vi.fn(),
            });
            rerender(
                <ProtectedRoute>
                    <div>Protected Content</div>
                </ProtectedRoute>
            );

            expect(screen.getByText(/loading/i)).toBeInTheDocument();

            // Then authenticated
            const mockUser: Partial<User> = {
                uid: 'test-user-123',
                email: 'test@example.com',
            };
            vi.mocked(useAuth).mockReturnValue({
                user: mockUser as User,
                loading: false,
                signIn: vi.fn(),
                signUp: vi.fn(),
                signOut: vi.fn(),
            });
            rerender(
                <ProtectedRoute>
                    <div>Protected Content</div>
                </ProtectedRoute>
            );

            expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
            expect(screen.getByText('Protected Content')).toBeInTheDocument();
        });

        it('should handle empty children gracefully', () => {
            const mockUser: Partial<User> = {
                uid: 'test-user-123',
                email: 'test@example.com',
            };
            vi.mocked(useAuth).mockReturnValue({
                user: mockUser as User,
                loading: false,
                signIn: vi.fn(),
                signUp: vi.fn(),
                signOut: vi.fn(),
            });

            const { container } = render(<ProtectedRoute>{null}</ProtectedRoute>);

            expect(container.firstChild).toBeNull();
        });
    });
});
