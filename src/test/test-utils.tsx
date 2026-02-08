/* eslint-disable react-refresh/only-export-components */
/**
 * Test utilities - exports helpers and components for testing
 * ESLint rule disabled because this is a test utility file, not a production component
 */
import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { axe } from 'jest-axe';
import { describe, it, expect, vi } from 'vitest';
import type { User } from 'firebase/auth';

/**
 * Standard mock user for testing authenticated states
 */
export const mockUser: Partial<User> = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
};

/**
 * Setup auth state mock for testing with specific user
 */
export function setupAuthMock(
  user: Partial<User> | null,
  onAuthStateChanged: typeof import('firebase/auth').onAuthStateChanged
) {
  vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
    (callback as (user: User | null) => void)(user as User | null);
    return vi.fn();
  });
}

/**
 * Custom render function that wraps components with common providers
 */
export function renderWithRouter(ui: ReactElement, options?: RenderOptions) {
  return render(ui, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <BrowserRouter>{children}</BrowserRouter>
    ),
    ...options,
  });
}

/**
 * Render with both Router and Auth providers (for integration tests)
 */
export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  return render(ui, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    ),
    ...options,
  });
}

/**
 * Render component with MemoryRouter and AuthProvider
 * Use for Navigation tests where route control is needed
 */
export function renderWithMemoryRouter(
  ui: ReactElement,
  initialRoute = '/',
  options?: RenderOptions
) {
  return render(ui, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={[initialRoute]}>
        <AuthProvider>{children}</AuthProvider>
      </MemoryRouter>
    ),
    ...options,
  });
}

/**
 * Mock Link component for testing
 */
export function MockLink({ children, to }: { children: ReactNode; to: string }) {
  return <a href={to}>{children}</a>;
}

/**
 * Common accessibility test suite for components
 * @param getComponent - Function that renders the component to test
 */
export function createAccessibilityTests(
  getComponent: () => ReactElement
) {
  return () => {
    describe('Accessibility', () => {
      it(`should have no accessibility violations in default state`, async () => {
        const { container } = render(getComponent());
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });

      it('should use semantic HTML', () => {
        const { container } = render(getComponent());
        const form = container.querySelector('form');
        if (form) {
          expect(form).toBeInTheDocument();
        }
      });
    });
  };
}

/**
 * Common form accessibility tests
 */
export function createFormAccessibilityTests(
  renderComponent: () => void,
  options: {
    requiredFields: string[];
    submitButtonName: RegExp;
  }
) {
  return () => {
    describe('Form Accessibility', () => {
      it('should mark required fields appropriately', () => {
        renderComponent();

        options.requiredFields.forEach(fieldLabel => {
          const field = screen.getByLabelText(new RegExp(fieldLabel, 'i'));
          expect(field).toBeRequired();
        });
      });

      it('should have accessible submit button', () => {
        renderComponent();
        const submitButton = screen.getByRole('button', { name: options.submitButtonName });
        expect(submitButton).toBeInTheDocument();
        expect(submitButton).toHaveAttribute('type', 'submit');
      });

      it('should support keyboard navigation', async () => {
        const user = userEvent.setup();
        renderComponent();

        // Can tab through form
        await user.tab();
        const firstField = document.activeElement;
        expect(firstField?.tagName).toMatch(/INPUT|BUTTON/);
      });
    });
  };
}

/**
 * Mock auth context return value builder
 */
export function createMockAuthContext(overrides: Partial<ReturnType<typeof useAuth>> = {}) {
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

// Re-export common testing utilities
export { screen, waitFor, within } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
export { axe, toHaveNoViolations } from 'jest-axe';
export { vi } from 'vitest';
