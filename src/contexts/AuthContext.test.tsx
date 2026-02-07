import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock Firebase before importing AuthContext
vi.mock('../firebase', () => ({
  getAuthInstance: vi.fn(() => ({} as unknown)),
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth, callback) => {
    // Delay callback to allow checking initial loading state
    setTimeout(() => callback(null), 0);
    return vi.fn();
  }),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));

import { AuthProvider, useAuth } from './AuthContext';

// Test component to access the auth context
function TestComponent() {
  const { user, loading, signIn, signUp, signOut, resetPassword } = useAuth();

  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'ready'}</div>
      <div data-testid="user">{user ? user.email : 'no user'}</div>
      <button onClick={() => signIn('test@example.com', 'password123')}>
        Sign In
      </button>
      <button onClick={() => signUp('new@example.com', 'password123')}>
        Sign Up
      </button>
      <button onClick={signOut}>Sign Out</button>
      <button onClick={() => resetPassword && resetPassword('reset@example.com')}>
        Reset Password
      </button>
    </div>
  );
}

// Helper to render component with provider
const renderWithProvider = (component: React.ReactElement) => {
  return render(<AuthProvider>{component}</AuthProvider>);
};

// Helper to wait for loading to complete
const waitForReady = async () => {
  await waitFor(() => {
    expect(screen.getByTestId('loading')).toHaveTextContent('ready');
  });
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AuthProvider', () => {
    it('should provide authentication context to children', () => {
      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByTestId('user')).toBeInTheDocument();
    });

    it('should initially have loading state as true', () => {
      renderWithProvider(<TestComponent />);
      expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    });

    it('should set loading to false after initialization', async () => {
      renderWithProvider(<TestComponent />);
      await waitForReady();
    });

    it('should initially have no authenticated user', async () => {
      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('no user');
      });
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { });

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleError.mockRestore();
    });

    it('should provide signIn function', () => {
      renderWithProvider(<TestComponent />);
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should provide signUp function', () => {
      renderWithProvider(<TestComponent />);
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('should provide signOut function', () => {
      renderWithProvider(<TestComponent />);
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
    });

    it('should call signInWithEmailAndPassword when signIn is called', async () => {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const user = userEvent.setup();

      renderWithProvider(<TestComponent />);
      await waitForReady();

      const signInButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(signInButton);

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
    });

    it('should call createUserWithEmailAndPassword when signUp is called', async () => {
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const user = userEvent.setup();

      renderWithProvider(<TestComponent />);
      await waitForReady();

      const signUpButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(signUpButton);

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'new@example.com',
        'password123'
      );
    });

    it('should call Firebase signOut when signOut is called', async () => {
      const { signOut: firebaseSignOut } = await import('firebase/auth');
      const user = userEvent.setup();

      renderWithProvider(<TestComponent />);
      await waitForReady();

      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      await user.click(signOutButton);

      expect(firebaseSignOut).toHaveBeenCalledWith(expect.anything());
    });
  });

  describe('Authentication State', () => {
    it('should update user state when authentication state changes', async () => {
      renderWithProvider(<TestComponent />);
      await waitForReady();
      // When implemented, this should handle auth state changes
      // and update the user accordingly
    });
  });

  describe('Password Reset', () => {
    // Helper component for error testing
    const createErrorTestComponent = (email: string) => {
      return function TestResetComponent() {
        const { resetPassword } = useAuth();
        const [errorCode, setErrorCode] = React.useState('');

        const handleReset = async () => {
          try {
            await resetPassword?.(email);
          } catch (error: unknown) {
            const firebaseError = error as { code?: string };
            setErrorCode(firebaseError.code || 'unknown');
          }
        };

        return (
          <div>
            <button onClick={handleReset}>Reset</button>
            <div data-testid="error">{errorCode}</div>
          </div>
        );
      };
    };

    it('should provide resetPassword function in context', () => {
      const TestResetComponent = () => {
        const { resetPassword } = useAuth();
        return <div data-testid="has-reset">{typeof resetPassword === 'function' ? 'yes' : 'no'}</div>;
      };

      renderWithProvider(<TestResetComponent />);
      expect(screen.getByTestId('has-reset')).toHaveTextContent('yes');
    });

    it('should call sendPasswordResetEmail with correct parameters', async () => {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      vi.mocked(sendPasswordResetEmail).mockResolvedValueOnce(undefined);

      const TestResetComponent = () => {
        const { resetPassword } = useAuth();
        return (
          <button onClick={() => resetPassword?.('test@example.com')}>
            Reset
          </button>
        );
      };

      renderWithProvider(<TestResetComponent />);

      const button = screen.getByRole('button', { name: /reset/i });
      button.click();

      await waitFor(() => {
        expect(sendPasswordResetEmail).toHaveBeenCalledWith(
          expect.anything(),
          'test@example.com'
        );
      });
    });

    it('should handle successful password reset', async () => {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      vi.mocked(sendPasswordResetEmail).mockResolvedValueOnce(undefined);

      const TestResetComponent = () => {
        const { resetPassword } = useAuth();
        const [message, setMessage] = React.useState('');

        const handleReset = async () => {
          try {
            await resetPassword?.('test@example.com');
            setMessage('success');
          } catch {
            setMessage('error');
          }
        };

        return (
          <div>
            <button onClick={handleReset}>Reset</button>
            <div data-testid="message">{message}</div>
          </div>
        );
      };

      renderWithProvider(<TestResetComponent />);

      const button = screen.getByRole('button', { name: /reset/i });
      button.click();

      await waitFor(() => {
        expect(screen.getByTestId('message')).toHaveTextContent('success');
      });
    });

    const testPasswordResetError = async (errorCode: string, email = 'test@example.com') => {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      const error = { code: errorCode, message: errorCode };
      vi.mocked(sendPasswordResetEmail).mockRejectedValueOnce(error);

      const TestResetComponent = createErrorTestComponent(email);
      renderWithProvider(<TestResetComponent />);

      const button = screen.getByRole('button', { name: /reset/i });
      button.click();

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(errorCode);
      });
    };

    it('should handle auth/user-not-found error', async () => {
      await testPasswordResetError('auth/user-not-found', 'nonexistent@example.com');
    });

    it('should handle auth/invalid-email error', async () => {
      await testPasswordResetError('auth/invalid-email', 'invalid-email');
    });

    it('should handle auth/too-many-requests error', async () => {
      await testPasswordResetError('auth/too-many-requests');
    });

    it('should trim email before sending reset request', async () => {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      vi.mocked(sendPasswordResetEmail).mockResolvedValueOnce(undefined);

      const TestResetComponent = () => {
        const { resetPassword } = useAuth();
        return (
          <button onClick={() => resetPassword?.('  test@example.com  ')}>
            Reset
          </button>
        );
      };

      renderWithProvider(<TestResetComponent />);

      const button = screen.getByRole('button', { name: /reset/i });
      button.click();

      await waitFor(() => {
        expect(sendPasswordResetEmail).toHaveBeenCalledWith(
          expect.anything(),
          'test@example.com'
        );
      });
    });

    it('should not affect user state when resetting password', async () => {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      vi.mocked(sendPasswordResetEmail).mockResolvedValueOnce(undefined);

      renderWithProvider(<TestComponent />);
      await waitForReady();

      const userBefore = screen.getByTestId('user').textContent;
      const resetButton = screen.getByRole('button', { name: /reset password/i });
      resetButton.click();

      await waitFor(() => {
        expect(sendPasswordResetEmail).toHaveBeenCalled();
      });

      expect(screen.getByTestId('user')).toHaveTextContent(userBefore || '');
    });
  });
});

