# Testing Guide

This project uses **Test-Driven Development (TDD)** with Vitest and React Testing Library.

## Testing Stack

- **[Vitest](https://vitest.dev/)** - Fast unit test framework (Vite-native)
- **[React Testing Library](https://testing-library.com/react)** - Test React components
- **[jsdom](https://github.com/jsdom/jsdom)** - Browser environment simulation
- **[@testing-library/jest-dom](https://github.com/testing-library/jest-dom)** - Custom matchers
- **[@testing-library/user-event](https://testing-library.com/docs/user-event/intro)** - User interaction simulation

## Running Tests

### Watch Mode (Development)

```bash
npm test
```

Runs tests in watch mode. Tests automatically re-run when you save files.

### Single Run (Manual Testing)

```bash
npm run test:run
```

Runs all tests once and exits. Useful for quick verification before committing.

### CI Mode (Continuous Integration)

```bash
npm run test:ci
```

Runs tests once with coverage report. This is the command used in CI/CD pipelines (GitHub Actions).

### UI Mode

```bash
npm run test:ui
```

Opens an interactive browser-based UI for exploring and debugging tests.

### Coverage Report

```bash
npm run test:coverage
```

Generates a code coverage report showing which lines are tested.

### Run Specific Tests

```bash
# Run tests in a specific file
npm test -- Counter.test.tsx

# Run tests matching a pattern
npm test -- --grep "should increment"

# Run tests in a specific folder
npm test -- src/components
```

## Writing Tests

### Test File Structure

Test files should be co-located with the component they test:

```
src/
  components/
    Counter.tsx
    Counter.test.tsx  ← Test file
    Counter.css
```

### Basic Test Template

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ComponentName } from "./ComponentName";

describe("ComponentName", () => {
  it("should render correctly", () => {
    render(<ComponentName />);
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
  });
});
```

### Testing User Interactions

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentName } from "./ComponentName";

describe("ComponentName", () => {
  it("should handle button click", async () => {
    const user = userEvent.setup();
    render(<ComponentName />);

    const button = screen.getByRole("button", { name: /click me/i });
    await user.click(button);

    expect(screen.getByText("Clicked!")).toBeInTheDocument();
  });
});
```

### Testing Async Operations

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ComponentName } from "./ComponentName";

describe("ComponentName", () => {
  it("should load data", async () => {
    render(<ComponentName />);

    // Wait for async operation to complete
    await waitFor(() => {
      expect(screen.getByText("Data loaded")).toBeInTheDocument();
    });
  });
});
```

### Mocking Firebase

When testing components that use Firebase:

```typescript
import { vi } from "vitest";
import * as firebase from "../src/firebase";

// Mock Firebase services
vi.spyOn(firebase, "getAuthInstance").mockReturnValue({
  currentUser: { uid: "test-user", email: "test@example.com" },
} as any);

vi.spyOn(firebase, "getDbInstance").mockReturnValue({
  collection: vi.fn(),
  doc: vi.fn(),
} as any);
```

## TDD Workflow

### Red-Green-Refactor Cycle

1. **Red**: Write a failing test first

   ```typescript
   it("should display user name", () => {
     render(<UserProfile name="John" />);
     expect(screen.getByText("John")).toBeInTheDocument();
   });
   ```

2. **Green**: Write minimal code to make it pass

   ```typescript
   function UserProfile({ name }: { name: string }) {
     return <div>{name}</div>;
   }
   ```

3. **Refactor**: Improve code while keeping tests green
   ```typescript
   function UserProfile({ name }: { name: string }) {
     return (
       <div className="user-profile">
         <h2>{name}</h2>
       </div>
     );
   }
   ```

### Best Practices

1. **Write tests first** - Before implementing features
2. **Test behavior, not implementation** - Focus on what users see/do
3. **Use semantic queries** - Prefer `getByRole`, `getByLabelText` over `getByTestId`
4. **Keep tests simple** - One concept per test
5. **Use descriptive test names** - Start with "should..."
6. **Arrange-Act-Assert** - Organize test logic clearly

## Common Testing Patterns

### Testing Forms

```typescript
it("should submit form with user input", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();

  render(<MyForm onSubmit={onSubmit} />);

  // Fill in form
  await user.type(screen.getByLabelText(/name/i), "John Doe");
  await user.type(screen.getByLabelText(/email/i), "john@example.com");

  // Submit
  await user.click(screen.getByRole("button", { name: /submit/i }));

  // Verify
  expect(onSubmit).toHaveBeenCalledWith({
    name: "John Doe",
    email: "john@example.com",
  });
});
```

### Testing Conditional Rendering

```typescript
it("should show error message when validation fails", () => {
  render(<MyForm error="Invalid input" />);
  expect(screen.getByText("Invalid input")).toBeInTheDocument();
});

it("should not show error when valid", () => {
  render(<MyForm />);
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
```

### Testing Loading States

```typescript
it("should show loading spinner while fetching", () => {
  render(<DataComponent isLoading={true} />);
  expect(screen.getByRole("status")).toBeInTheDocument();
});

it("should show data when loaded", () => {
  render(<DataComponent isLoading={false} data={mockData} />);
  expect(screen.getByText("Data content")).toBeInTheDocument();
});
```

## Query Priority

Use queries in this order of preference:

1. **`getByRole`** - Most accessible, preferred method

   ```typescript
   screen.getByRole("button", { name: /submit/i });
   ```

2. **`getByLabelText`** - Good for form fields

   ```typescript
   screen.getByLabelText(/email/i);
   ```

3. **`getByPlaceholderText`** - For inputs with placeholders

   ```typescript
   screen.getByPlaceholderText(/enter email/i);
   ```

4. **`getByText`** - For non-interactive elements

   ```typescript
   screen.getByText(/welcome/i);
   ```

5. **`getByTestId`** - Last resort only
   ```typescript
   screen.getByTestId("custom-element");
   ```

## Debugging Tests

### View Rendered Output

```typescript
import { render, screen } from "@testing-library/react";

const { debug } = render(<MyComponent />);
debug(); // Prints the DOM tree

// Or debug a specific element
screen.debug(screen.getByRole("button"));
```

### Check Available Queries

```typescript
screen.logTestingPlaygroundURL();
// Opens a URL with suggestions for better queries
```

### Vitest UI

Run `npm run test:ui` and use the browser interface to:

- See test results in real-time
- Inspect component snapshots
- View console logs
- Debug failing tests

## Configuration

Test configuration is in `vite.config.ts`:

```typescript
export default defineConfig({
  test: {
    globals: true, // Use global test functions
    environment: "jsdom", // Simulate browser environment
    setupFiles: "./src/test/setup.ts", // Setup file
    css: true, // Process CSS imports
  },
});
```

Setup file at `src/test/setup.ts`:

```typescript
import "@testing-library/jest-dom"; // Custom matchers
```

## Continuous Integration

Tests run automatically on every push via GitHub Actions. See `.github/workflows/` for CI configuration.

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Common Testing Library Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Library Queries Cheatsheet](https://testing-library.com/docs/queries/about)
