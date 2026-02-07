import { describe, it, expect, type Mock } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Test error handling for form submission failures
 */
export function runErrorHandlingTests(
  componentName: string,
  options: {
    renderComponent: () => void;
    fillForm: (user: ReturnType<typeof userEvent.setup>) => Promise<void>;
    mockSubmit: () => Mock;
    errors: { code?: string; message?: string; expectedDisplay: RegExp }[];
  },
) {
  describe(`${componentName} - Error Handling`, () => {
    options.errors.forEach((error) => {
      const testName = error.code
        ? `should display error for ${error.code}`
        : 'should display generic error message';

      it(testName, async () => {
        const user = userEvent.setup();
        const mockFn = options.mockSubmit();
        const errorObj = error.code ? { code: error.code } : new Error(error.message || 'Error');
        mockFn.mockRejectedValueOnce(errorObj);
        options.renderComponent();

        await options.fillForm(user);

        const submitButton = screen.getByRole('button', { name: /submit|sign|reset|send/i });
        await user.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText(error.expectedDisplay)).toBeInTheDocument();
        });
      });
    });

    it('should re-enable submit button after error', async () => {
      const user = userEvent.setup();
      const mockFn = options.mockSubmit();
      mockFn.mockRejectedValueOnce(new Error('Network error'));
      options.renderComponent();

      await options.fillForm(user);

      const submitButton = screen.getByRole('button', { name: /submit|sign|reset|send/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });
}
