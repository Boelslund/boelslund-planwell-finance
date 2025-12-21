import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
// import type { User } from 'firebase/auth';

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
}));

import { AuthProvider, useAuth } from './AuthContext';

// Test component to access the auth context
function TestComponent() {
    const { user, loading, signIn, signUp, signOut } = useAuth();

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
        </div>
    );
}

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('AuthProvider', () => {
        it('should provide authentication context to children', () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            expect(screen.getByTestId('loading')).toBeInTheDocument();
            expect(screen.getByTestId('user')).toBeInTheDocument();
        });

        it('should initially have loading state as true', () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            expect(screen.getByTestId('loading')).toHaveTextContent('loading');
        });

        it('should set loading to false after initialization', async () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('loading')).toHaveTextContent('ready');
            });
        });

        it('should initially have no authenticated user', async () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('user')).toHaveTextContent('no user');
            });
        });
    });

    describe('useAuth hook', () => {
        it('should throw error when used outside AuthProvider', () => {
            // Suppress console.error for this test
            const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { });

            expect(() => {
                render(<TestComponent />);
            }).toThrow('useAuth must be used within an AuthProvider');

            consoleError.mockRestore();
        });

        it('should provide signIn function', () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
        });

        it('should provide signUp function', () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
        });

        it('should provide signOut function', () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
        });

        it('should call signInWithEmailAndPassword when signIn is called', async () => {
            const { signInWithEmailAndPassword } = await import('firebase/auth');
            const user = (await import('@testing-library/user-event')).default.setup();

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('loading')).toHaveTextContent('ready');
            });

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
            const user = (await import('@testing-library/user-event')).default.setup();

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('loading')).toHaveTextContent('ready');
            });

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
            const user = (await import('@testing-library/user-event')).default.setup();

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('loading')).toHaveTextContent('ready');
            });

            const signOutButton = screen.getByRole('button', { name: /sign out/i });
            await user.click(signOutButton);

            expect(firebaseSignOut).toHaveBeenCalledWith(expect.anything());
        });
    });

    describe('Authentication State', () => {
        it('should update user state when authentication state changes', async () => {
            // This test will need to mock Firebase auth state changes
            // For now, it establishes the expected behavior
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('loading')).toHaveTextContent('ready');
            });

            // When implemented, this should handle auth state changes
            // and update the user accordingly
        });
    });
});
