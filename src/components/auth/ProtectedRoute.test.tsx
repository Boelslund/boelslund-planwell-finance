import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
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
  const mockUser: Partial<User> = {
    uid: 'test-user-123',
    email: 'test@example.com',
    emailVerified: true,
  };

  const mockAuthContext = (overrides: { user?: User | null; loading?: boolean } = {}) => {
    vi.mocked(useAuth).mockReturnValue({
      user: overrides.user ?? null,
      loading: overrides.loading ?? false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
    });
  };

  const renderProtectedRoute = (children: ReactNode, redirectTo?: string) => {
    return render(<ProtectedRoute redirectTo={redirectTo}>{children}</ProtectedRoute>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading indicator when authentication is being checked', () => {
      mockAuthContext({ loading: true });

      renderProtectedRoute(<div>Protected Content</div>);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should not show children during loading', () => {
      mockAuthContext({ loading: true });

      renderProtectedRoute(<div>Secret Data</div>);

      expect(screen.queryByText('Secret Data')).not.toBeInTheDocument();
    });
  });

  describe('Unauthenticated Access', () => {
    it('should redirect to home page when user is not authenticated', () => {
      mockAuthContext();

      renderProtectedRoute(<div>Protected Content</div>);

      expect(screen.getByTestId('navigate')).toHaveTextContent('/');
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should not render children when user is not authenticated', () => {
      mockAuthContext();

      renderProtectedRoute(<div data-testid="protected-content">Sensitive Information</div>);

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('Authenticated Access', () => {
    it('should render children when user is authenticated', () => {
      mockAuthContext({ user: mockUser as User });

      renderProtectedRoute(<div>Protected Content</div>);

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should not show loading or redirect when user is authenticated', () => {
      mockAuthContext({ user: mockUser as User });

      renderProtectedRoute(<div>Dashboard</div>);

      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('should render multiple child elements when authenticated', () => {
      mockAuthContext({ user: mockUser as User });

      renderProtectedRoute(
        <>
          <h1>Dashboard</h1>
          <p>Welcome back!</p>
          <button>Logout</button>
        </>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Welcome back!')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });
  });

  describe('Custom Redirect Path', () => {
    it('should redirect to custom path when provided', () => {
      mockAuthContext();

      renderProtectedRoute(<div>Protected Content</div>, '/custom-login');

      expect(screen.getByTestId('navigate')).toHaveTextContent('/custom-login');
    });

    it('should use default /login path when no redirectTo prop is provided', () => {
      mockAuthContext();

      renderProtectedRoute(<div>Protected Content</div>);

      expect(screen.getByTestId('navigate')).toHaveTextContent('/');
    });
  });

  describe('Edge Cases', () => {
    it('should handle transition from loading to authenticated', () => {
      mockAuthContext({ loading: true });

      const { rerender } = renderProtectedRoute(<div>Protected Content</div>);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();

      // Then authenticated
      mockAuthContext({ user: mockUser as User });
      rerender(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should handle empty children gracefully', () => {
      mockAuthContext({ user: mockUser as User });

      const { container } = renderProtectedRoute(null);

      expect(container.firstChild).toBeNull();
    });
  });
});
