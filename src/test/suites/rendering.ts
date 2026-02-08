import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';

/**
 * Test basic component rendering elements
 * Tests heading, form fields, buttons, links, and helper text
 */
export function runComponentRenderingTests(
  componentName: string,
  options: {
    renderComponent: () => void;
    heading: RegExp;
    formFields: { label: RegExp; type?: string }[];
    submitButton: RegExp;
    links?: { text: RegExp; href: string }[];
    helperText?: RegExp;
  },
) {
  describe(`${componentName} - Rendering`, () => {
    it('should display heading', () => {
      options.renderComponent();
      expect(
        screen.getByRole('heading', { name: options.heading }),
      ).toBeInTheDocument();
    });

    options.formFields.forEach((field) => {
      it(`should render ${field.label.source} field`, () => {
        options.renderComponent();
        const input = screen.getByLabelText(field.label);
        expect(input).toBeInTheDocument();
        if (field.type) {
          expect(input).toHaveAttribute('type', field.type);
        }
      });
    });

    it('should render submit button', () => {
      options.renderComponent();
      expect(
        screen.getByRole('button', { name: options.submitButton }),
      ).toBeInTheDocument();
    });

    if (options.links) {
      options.links.forEach((link) => {
        it(`should have link: ${link.text.source}`, () => {
          options.renderComponent();
          const linkElement = screen.getByText(link.text);
          expect(linkElement).toBeInTheDocument();
          expect(linkElement).toHaveAttribute('href', link.href);
        });
      });
    }

    const helperText = options.helperText;
    if (helperText) {
      it('should display helper text', () => {
        options.renderComponent();
        expect(screen.getByText(helperText)).toBeInTheDocument();
      });
    }
  });
}
