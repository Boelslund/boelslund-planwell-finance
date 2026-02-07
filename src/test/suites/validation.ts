import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Test form validation behavior
 */
export function runFormValidationTests(
  componentName: string,
  options: {
    renderComponent: () => void;
    requiredFields: { label: RegExp; errorMessage: RegExp }[];
    mockSubmit: () => unknown;
  },
) {
  describe(`${componentName} - Form Validation`, () => {
    options.requiredFields.forEach((field) => {
      it(`should show error when ${field.label.source} is empty`, async () => {
        const user = userEvent.setup();
        options.renderComponent();

        const submitButton = screen.getByRole('button', {
          name: /submit|sign|reset|send/i,
        });
        await user.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText(field.errorMessage)).toBeInTheDocument();
        });
        expect(options.mockSubmit()).not.toHaveBeenCalled();
      });

      it(`should mark ${field.label.source} as required`, () => {
        options.renderComponent();
        const input = screen.getByLabelText(field.label);
        expect(input).toBeRequired();
      });
    });
  });
}
