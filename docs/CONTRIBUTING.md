# Contributing Guide

Thank you for considering contributing to Boelslund PlanWell Finance! This document outlines the development workflow and coding standards.

## Development Workflow

### 1. Set Up Development Environment

Follow the [Environment Setup Guide](./ENVIRONMENT_SETUP.md) to get started.

### 2. Create a Feature Branch

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests

### 3. Follow TDD Principles

**Write tests first, then implementation:**

```typescript
// 1. Write failing test
it('should calculate monthly amount', () => {
  const result = calculateMonthlyAmount(expenses)
  expect(result).toBe(250)
})

// 2. Implement minimal code to pass
function calculateMonthlyAmount(expenses: Expense[]) {
  return expenses.reduce((sum, exp) => sum + exp.monthlyAmount, 0)
}

// 3. Refactor if needed while keeping tests green
```

### 4. Commit Your Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add expense calculation logic"
```

#### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Code style (formatting, missing semi-colons)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

**Examples:**
```bash
feat(auth): add user registration flow
fix(expenses): correct monthly calculation
docs(readme): update setup instructions
test(calculator): add edge case tests
```

### 5. Push and Create Pull Request

```bash
# Push branch
git push origin feature/your-feature-name
```

Create a Pull Request on GitHub:
1. Go to repository on GitHub
2. Click "Pull requests" → "New pull request"
3. Select your branch
4. Fill in PR template with description
5. Request review

## Code Standards

### TypeScript

- **Use TypeScript** for all new files
- **Define types explicitly** - Avoid `any` when possible
- **Use interfaces** for object shapes
- **Export types** that are used across files

```typescript
// ✅ Good
interface Expense {
  id: string
  name: string
  amount: number
  frequency: 'monthly' | 'annual'
}

function addExpense(expense: Expense): void {
  // ...
}

// ❌ Avoid
function addExpense(expense: any) {
  // ...
}
```

### React Components

- **Use functional components** with hooks
- **One component per file**
- **Export component as default** or named export
- **Props interface** before component

```typescript
interface UserProfileProps {
  name: string
  email: string
  onUpdate?: (user: User) => void
}

export function UserProfile({ name, email, onUpdate }: UserProfileProps) {
  return (
    <div className="user-profile">
      <h2>{name}</h2>
      <p>{email}</p>
    </div>
  )
}
```

### File Organization

```
src/
├── components/          # Reusable UI components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── Button.css
│   └── ...
├── features/           # Feature-specific components
│   ├── expenses/
│   │   ├── ExpenseForm.tsx
│   │   ├── ExpenseList.tsx
│   │   └── ...
│   └── auth/
├── hooks/              # Custom React hooks
├── utils/              # Helper functions
├── types/              # Shared TypeScript types
├── config/             # Configuration files
└── test/               # Test utilities
```

### Naming Conventions

- **Components**: PascalCase - `UserProfile.tsx`
- **Hooks**: camelCase with "use" prefix - `useAuth.ts`
- **Utils**: camelCase - `formatCurrency.ts`
- **Types**: PascalCase - `Expense`, `User`
- **Constants**: UPPER_SNAKE_CASE - `MAX_EXPENSES`

### Testing

- **Co-locate tests** with components
- **Test file naming**: `ComponentName.test.tsx`
- **Test descriptions**: Start with "should..."
- **Coverage target**: Aim for 80%+ coverage

See [TESTING.md](./TESTING.md) for detailed testing guidelines.

### Code Style

This project uses ESLint for code quality:

```bash
# Check for issues
npm run lint

# Auto-fix issues (when possible)
npm run lint -- --fix
```

**Key rules:**
- Use 2 spaces for indentation
- Single quotes for strings (unless escaping needed)
- Semicolons required
- No unused variables
- Prefer `const` over `let`

### Firebase

- **Use lazy initialization** - See [firebase-lazy-init.md](./firebase-lazy-init.md)
- **Use getter functions** - `getAuthInstance()`, `getDbInstance()`
- **Handle errors gracefully** - Wrap Firebase calls in try-catch
- **Mock in tests** - Don't make real Firebase calls in tests

## Pull Request Guidelines

### Before Submitting

- [ ] All tests pass (`npm test -- --run`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Code builds successfully (`npm run build`)
- [ ] Added tests for new features
- [ ] Updated documentation if needed
- [ ] Commit messages follow conventions

### PR Description Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
How has this been tested?

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Tests pass
- [ ] Linting passes
- [ ] Documentation updated
```

### Review Process

1. **Automated checks** run on PR creation
2. **Code review** by maintainer
3. **Address feedback** - Make requested changes
4. **Approval & merge** - Once approved, PR will be merged

## Getting Help

- **Questions?** Open a [GitHub Discussion](https://github.com/Boelslund/boelslund-planwell-finance/discussions)
- **Bug found?** Create an [Issue](https://github.com/Boelslund/boelslund-planwell-finance/issues)
- **Documentation unclear?** Suggest improvements via PR

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
