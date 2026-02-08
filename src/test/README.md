# Test Utilities and Shared Test Suites

This directory contains reusable testing utilities and shared test suites to reduce repetition across test files.

## Directory Structure

```
src/test/
├── suites/
│   ├── index.ts              # Re-exports all suites (convenience)
│   ├── accessibility.ts      # Accessibility & WCAG tests
│   ├── rendering.ts          # Form rendering tests
│   ├── validation.ts         # Form validation tests
│   ├── submission.ts         # Successful submission tests
│   ├── error-handling.ts     # Error handling tests
│   └── user-experience.ts    # UX features tests
└── test-utils.tsx            # Rendering helpers and mocks
```

### Benefits of This Structure

1. **Smaller Files**: Each file focuses on one category (~50-150 lines)
2. **Easier Navigation**: Find specific test suites quickly
3. **Better IDE Performance**: Faster type checking and autocomplete
4. **Clearer Dependencies**: See exactly which suites you're using
5. **Easier to Extend**: Add new suites without cluttering one large file

## Usage

### Basic Rendering

```typescript
import { renderWithRouter, renderWithProviders } from '../../test/test-utils';

// Simple component with router
renderWithRouter(<MyComponent />);

// Component needing auth context (integration tests)
renderWithProviders(<MyComponent />);
```

### Mock Auth Context

```typescript
import { createMockAuthContext } from "../../test/test-utils";

vi.mocked(useAuth).mockReturnValue(
  createMockAuthContext({
    resetPassword: mockResetPassword,
    // Override only what you need
  }),
);
```

### Shared Test Suites

Instead of writing the same accessibility tests in every file:

```typescript
// Option 1: Import all suites from index (Recommended)
import {
  runFormAccessibilityTests,
  runComponentRenderingTests,
  runFormValidationTests,
  runSuccessfulSubmissionTests,
  runErrorHandlingTests,
  runUserExperienceTests
} from '../../test/suites';

// Option 2: Import from specific files
import { runFormAccessibilityTests } from '../../test/suites/accessibility';
import { runComponentRenderingTests } from '../../test/suites/rendering';

// Add comprehensive accessibility tests with one function call
runFormAccessibilityTests('MyComponent', () => render(<MyComponent />));
```

#### Available Shared Test Suites

##### Accessibility Suites

1. **`runFormAccessibilityTests`** - Basic form accessibility (semantic HTML, heading hierarchy, axe violations)

2. **`runFormErrorAccessibilityTests`** - Tests error state accessibility (error association with inputs, axe violations with errors)

3. **`runKeyboardNavigationTests`** - Tests tab navigation through interactive elements

4. **`runLoadingStateAccessibilityTests`** - Tests accessibility during loading states

##### Rendering Suite

5. **`runComponentRenderingTests`** - Tests basic component elements (heading, fields, buttons, links, helper text)
   ```typescript
   runComponentRenderingTests("PasswordReset", {
     renderComponent,
     heading: /reset password/i,
     formFields: [{ label: /email/i, type: "email" }],
     submitButton: /send reset link/i,
     links: [{ text: /back to sign in/i, href: "/signin" }],
     helperText: /enter your email.*reset link/i,
   });
   ```

##### Validation Suite

6. **`runFormValidationTests`** - Tests required field validation and error messages
   ```typescript
   runFormValidationTests("PasswordReset", {
     renderComponent,
     requiredFields: [{ label: /email/i, errorMessage: /email is required/i }],
     mockSubmit: () => mockResetPassword,
   });
   ```

##### Submission Suite

7. **`runSuccessfulSubmissionTests`** - Tests successful form submission, loading states, success messages
   ```typescript
   runSuccessfulSubmissionTests("PasswordReset", {
     renderComponent,
     fillForm: async (user) => {
       await user.type(screen.getByLabelText(/email/i), "test@example.com");
     },
     mockSubmit: () => mockResetPassword,
     expectedCallArgs: ["test@example.com"],
     successMessages: [/reset link.*sent/i],
     shouldClearForm: true,
     shouldShowLoading: true,
     loadingText: /sending/i,
   });
   ```

##### Error Handling Suite

8. **`runErrorHandlingTests`** - Tests various error scenarios and recovery
   ```typescript
   runErrorHandlingTests("PasswordReset", {
     renderComponent,
     fillForm: async (user) => {
       await user.type(screen.getByLabelText(/email/i), "test@example.com");
     },
     mockSubmit: () => mockResetPassword,
     errors: [
       { code: "auth/user-not-found", expectedDisplay: /no account.*email/i },
       { code: "auth/invalid-email", expectedDisplay: /invalid email/i },
       { message: "Network error", expectedDisplay: /reset failed|error/i },
     ],
   });
   ```

##### User Experience Suite

9. **`runUserExperienceTests`** - Tests UX features (focus management, whitespace trimming, keyboard shortcuts)
   ```typescript
   runUserExperienceTests("PasswordReset", {
     renderComponent,
     fillForm: async (user) => {
       await user.type(screen.getByLabelText(/email/i), "test@example.com");
     },
     mockSubmit: () => mockResetPassword,
     focusOnMount: /email/i,
     shouldTrimWhitespace: {
       field: /email/i,
       expectedValue: "test@example.com",
     },
     shouldAllowEnterSubmit: true,
   });
   ```

## Benefits

### ✅ Consistency

All components tested the same way with shared standards

### ✅ Less Code

Reduce test file sizes by 40-60%

### ✅ Easy Updates

Add a new accessibility check once, it applies everywhere

### ✅ Better Coverage

Shared suites ensure you don't forget important tests

## Migration Strategy

1. **Start with new tests** - Use utilities in all new test files
2. **Refactor gradually** - Update existing tests when you touch them
3. **No rush** - Old tests still work, migrate when convenient

## Complete Example

Here's a full test file using all shared test suites:

```typescript
import { describe, beforeEach, vi } from 'vitest';
import { renderWithRouter, screen, userEvent } from '../../test/test-utils';
import {
  runFormAccessibilityTests,
  runComponentRenderingTests,
  runFormValidationTests,
  runSuccessfulSubmissionTests,
  runErrorHandlingTests,
  runUserExperienceTests
} from '../../test/suites';

describe('MyForm', () => {
  const mockSubmit = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => renderWithRouter(<MyForm onSubmit={mockSubmit} />);
  const fillForm = async (user) => {
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
  };

  // Use shared suites - covers 90% of tests
  runComponentRenderingTests('MyForm', {
    renderComponent,
    heading: /my form/i,
    formFields: [{ label: /email/i, type: 'email' }],
    submitButton: /submit/i
  });

  runFormValidationTests('MyForm', {
    renderComponent,
    requiredFields: [{ label: /email/i, errorMessage: /email is required/i }],
    mockSubmit: () => mockSubmit
  });

  runSuccessfulSubmissionTests('MyForm', {
    renderComponent,
    fillForm,
    mockSubmit: () => mockSubmit,
    expectedCallArgs: ['test@example.com'],
    shouldShowLoading: true,
    loadingText: /submitting/i
  });

  runErrorHandlingTests('MyForm', {
    renderComponent,
    fillForm,
    mockSubmit: () => mockSubmit,
    errors: [
      { code: 'network-error', expectedDisplay: /network error/i }
    ]
  });

  runUserExperienceTests('MyForm', {
    renderComponent,
    fillForm,
    mockSubmit: () => mockSubmit,
    focusOnMount: /email/i,
    shouldAllowEnterSubmit: true
  });

  runFormAccessibilityTests('MyForm', renderComponent);

  // Component-specific tests only
  describe('Component-Specific Behavior', () => {
    it('should do something unique to this component', () => {
      // ...
    });
  });
});
```

### Before vs After

**Before (Repetitive):**
```typescript
describe('MyForm - Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<MyForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should use semantic form element', () => {
    const { container } = render(<MyForm />);
    expect(container.querySelector('form')).toBeInTheDocument();
  });

  it('should have proper heading hierarchy', () => {
    render(<MyForm />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toBeInTheDocument();
  });
});
```

**After (Reusable):**
```typescript
runFormAccessibilityTests('MyForm', () => render(<MyForm />));
```

## Adding New Shared Tests

When you notice a pattern appearing in 3+ test files:

1. Extract it to the appropriate file in `suites/` directory
2. Make it configurable with options
3. Export it from `suites/index.ts`
4. Document it in this README
5. Use it in your test files

## See Also

- [Test suites organization](./SUITES_ORGANIZATION.md) - Details on the suite file structure
- [Testing documentation](../../docs/TESTING.md) - Comprehensive testing guidelines
- [PasswordReset.test.tsx](../components/auth/PasswordReset.test.tsx) - Real example using all test suites
- [SignIn.test.tsx](../components/auth/SignIn.test.tsx) - Another complete example
- [SignUp.test.tsx](../components/auth/SignUp.test.tsx) - Additional reference implementation
