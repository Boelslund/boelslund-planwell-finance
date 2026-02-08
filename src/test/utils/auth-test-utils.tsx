import { vi } from 'vitest';
import type { ReactNode } from 'react';

/**
 * Setup common auth mocks for testing
 * @returns Mock functions and setup utilities
 */
export function setupAuthMocks() {
  const mockNavigate = vi.fn();
  const mockSignIn = vi.fn();
  const mockSignUp = vi.fn();
  const mockSignOut = vi.fn();
  const mockResetPassword = vi.fn();

  return {
    mockNavigate,
    mockSignIn,
    mockSignUp,
    mockSignOut,
    mockResetPassword,
  };
}

/**
 * Mock react-router-dom for testing
 */
export async function mockReactRouter() {
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

  return { mockNavigate };
}

/**
 * Mock useAuth hook for testing
 */
export function mockUseAuth() {
  vi.mock('../../contexts/AuthContext', () => ({
    useAuth: vi.fn(),
  }));
}

/**
 * Setup default auth context values
 */
export function getDefaultAuthContext(overrides = {}) {
  return {
    user: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
    ...overrides,
  };
}
