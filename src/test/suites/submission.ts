import { describe, it, expect, type Mock } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Test successful form submission behavior
 */
export function runSuccessfulSubmissionTests(
  componentName: string,
  options: {
    renderComponent: () => void;
    fillForm: (user: ReturnType<typeof userEvent.setup>) => Promise<void>;
    mockSubmit: () => Mock;
    expectedCallArgs?: unknown[];
    successMessage?: RegExp;
    successMessages?: RegExp[]; // Support multiple success message patterns
    shouldClearForm?: boolean;
    shouldShowLoading?: boolean;
    loadingText?: RegExp;
  },
) {
  describe(`${componentName} - Form Submission`, () => {
    it('should call submit handler with correct data', async () => {
      const user = userEvent.setup();
      const mockFn = options.mockSubmit();
      mockFn.mockResolvedValueOnce(undefined);
      options.renderComponent();

      await options.fillForm(user);

      const submitButton = screen.getByRole('button', {
        name: /submit|sign|reset|send/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        if (options.expectedCallArgs) {
          expect(mockFn).toHaveBeenCalledWith(...options.expectedCallArgs);
        } else {
          expect(mockFn).toHaveBeenCalled();
        }
      });
    });

    if (options.shouldShowLoading) {
      it('should disable submit button while processing', async () => {
        const user = userEvent.setup();
        const mockFn = options.mockSubmit();
        mockFn.mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100)),
        );
        options.renderComponent();

        await options.fillForm(user);

        const submitButton = screen.getByRole('button', {
          name: /submit|sign|reset|send/i,
        });
        await user.click(submitButton);

        expect(submitButton).toBeDisabled();
      });

      if (options.loadingText) {
        it('should show loading state while processing', async () => {
          const user = userEvent.setup();
          const mockFn = options.mockSubmit();
          mockFn.mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100)),
          );
          options.renderComponent();

          await options.fillForm(user);

          const submitButton = screen.getByRole('button', {
            name: /submit|sign|reset|send/i,
          });
          await user.click(submitButton);

          const loadingText = options.loadingText!;
          expect(screen.getByText(loadingText)).toBeInTheDocument();
        });
      }
    }

    if (options.successMessage || options.successMessages) {
      it('should display success message after successful submission', async () => {
        const user = userEvent.setup();
        const mockFn = options.mockSubmit();
        mockFn.mockResolvedValueOnce(undefined);
        options.renderComponent();

        await options.fillForm(user);

        const submitButton = screen.getByRole('button', {
          name: /submit|sign|reset|send/i,
        });
        await user.click(submitButton);

        await waitFor(() => {
          if (options.successMessages) {
            // Check all success message patterns
            options.successMessages.forEach((pattern) => {
              expect(screen.getByText(pattern)).toBeInTheDocument();
            });
          } else if (options.successMessage) {
            expect(screen.getByText(options.successMessage)).toBeInTheDocument();
          }
        });
      });
    }

    if (options.shouldClearForm) {
      it('should clear form after successful submission', async () => {
        const user = userEvent.setup();
        const mockFn = options.mockSubmit();
        mockFn.mockResolvedValueOnce(undefined);
        options.renderComponent();

        await options.fillForm(user);

        const submitButton = screen.getByRole('button', {
          name: /submit|sign|reset|send/i,
        });
        await user.click(submitButton);

        await waitFor(() => {
          const inputs = screen.getAllByRole('textbox');
          inputs.forEach((input) => {
            expect(input).toHaveValue('');
          });
        });
      });
    }
  });
}
