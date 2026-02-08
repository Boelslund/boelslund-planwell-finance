import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

/**
 * Shared accessibility test suite for forms
 * Run comprehensive accessibility tests on any form component
 */
export function runFormAccessibilityTests(
  componentName: string,
  renderComponent: () => { container: HTMLElement },
) {
  describe(`${componentName} - WCAG Compliance`, () => {
    it('should have no accessibility violations in default state', async () => {
      const { container } = renderComponent();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should use semantic form element', () => {
      const { container } = renderComponent();
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      renderComponent();
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
      const h1 = headings.find((h) => h.tagName === 'H1');
      expect(h1).toBeInTheDocument();
    });
  });
}

/**
 * Test form validation error states for accessibility
 */
export function runFormErrorAccessibilityTests(
  componentName: string,
  options: {
    renderComponent: () => { container: HTMLElement };
    triggerError: () => Promise<void>;
    errorMessage: RegExp;
    associatedInputLabel: RegExp;
  },
) {
  describe(`${componentName} - Error State Accessibility`, () => {
    it('should have no accessibility violations with validation errors', async () => {
      const { container } = options.renderComponent();

      await options.triggerError();

      await waitFor(() => {
        expect(screen.getByText(options.errorMessage)).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should associate error messages with inputs', async () => {
      options.renderComponent();

      await options.triggerError();

      await waitFor(() => {
        const input = screen.getByLabelText(options.associatedInputLabel);
        const errorMessage = screen.getByText(options.errorMessage);
        expect(input).toHaveAccessibleDescription(
          errorMessage.textContent || '',
        );
      });
    });
  });
}

/**
 * Test keyboard navigation for any component
 */
export function runKeyboardNavigationTests(
  componentName: string,
  renderComponent: () => void,
  options: {
    tabbableElements: { label?: RegExp; role?: string; name?: RegExp }[];
  },
) {
  describe(`${componentName} - Keyboard Navigation`, () => {
    it('should allow tabbing through interactive elements', async () => {
      const user = userEvent.setup();
      renderComponent();

      for (const element of options.tabbableElements) {
        await user.tab();

        if (element.label) {
          expect(screen.getByLabelText(element.label)).toHaveFocus();
        } else if (element.role && element.name) {
          expect(
            screen.getByRole(element.role, { name: element.name }),
          ).toHaveFocus();
        }
      }
    });

    it('should support shift-tab for backward navigation', async () => {
      const user = userEvent.setup();
      renderComponent();

      // Tab forward to last element
      for (let i = 0; i < options.tabbableElements.length; i++) {
        await user.tab();
      }

      // Tab backward
      await user.tab({ shift: true });

      const secondToLast =
        options.tabbableElements[options.tabbableElements.length - 2];
      if (secondToLast?.label) {
        expect(screen.getByLabelText(secondToLast.label)).toHaveFocus();
      }
    });
  });
}

/**
 * Test loading states accessibility
 */
export function runLoadingStateAccessibilityTests(
  componentName: string,
  options: {
    renderComponent: () => { container: HTMLElement };
    triggerLoading: () => Promise<void>;
    loadingIndicator: RegExp;
  },
) {
  describe(`${componentName} - Loading State Accessibility`, () => {
    it('should have no accessibility violations during loading', async () => {
      const { container } = options.renderComponent();

      await options.triggerLoading();

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should set appropriate aria-busy state while loading', async () => {
      options.renderComponent();

      await options.triggerLoading();

      const form = document.querySelector('form');
      expect(form).toHaveAttribute('aria-busy', 'true');
    });

    it('should show loading indicator', async () => {
      options.renderComponent();

      await options.triggerLoading();

      expect(screen.getByText(options.loadingIndicator)).toBeInTheDocument();
    });
  });
}
