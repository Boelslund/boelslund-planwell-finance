import { describe, it, expect, type Mock } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Test user experience features
 */
export function runUserExperienceTests(
  componentName: string,
  options: {
    renderComponent: () => void;
    fillForm: (user: ReturnType<typeof userEvent.setup>) => Promise<void>;
    mockSubmit: () => Mock;
    focusOnMount?: RegExp;
    shouldTrimWhitespace?: { field: RegExp; expectedValue: string };
    shouldAllowEnterSubmit?: boolean;
  },
) {
  describe(`${componentName} - User Experience`, () => {
    if (options.focusOnMount) {
      it('should focus first input on mount', () => {
        options.renderComponent();
        const input = screen.getByLabelText(options.focusOnMount!);
        expect(input).toHaveFocus();
      });
    }

    if (options.shouldTrimWhitespace) {
      it('should trim whitespace from input', async () => {
        const user = userEvent.setup();
        const mockFn = options.mockSubmit();
        mockFn.mockResolvedValueOnce(undefined);
        options.renderComponent();

        const whitespaceConfig = options.shouldTrimWhitespace!;
        const input = screen.getByLabelText(whitespaceConfig.field);
        await user.type(input, `  ${whitespaceConfig.expectedValue}  `);

        const submitButton = screen.getByRole('button', { name: /submit|sign|reset|send/i });
        await user.click(submitButton);

        await waitFor(() => {
          expect(mockFn).toHaveBeenCalledWith(
            expect.stringContaining(whitespaceConfig.expectedValue),
          );
        });
      });
    }

    if (options.shouldAllowEnterSubmit) {
      it('should allow submitting form by pressing Enter', async () => {
        const user = userEvent.setup();
        const mockFn = options.mockSubmit();
        mockFn.mockResolvedValueOnce(undefined);
        options.renderComponent();

        await options.fillForm(user);
        await user.keyboard('{Enter}');

        await waitFor(() => {
          expect(mockFn).toHaveBeenCalled();
        });
      });
    }
  });
}
