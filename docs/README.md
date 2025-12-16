# Documentation Index

Welcome to the Boelslund PlanWell Finance documentation! This folder contains comprehensive guides for developers working on this project.

## Getting Started

Start here if you're new to the project:

1. **[Environment Setup](./ENVIRONMENT_SETUP.md)** - Complete guide to setting up your development environment
   - Prerequisites and installation
   - Firebase project setup
   - Environment variable configuration
   - Troubleshooting common issues

## Core Documentation

### Development

- **[Contributing Guide](./CONTRIBUTING.md)** - Development workflow and coding standards
  - Branch naming conventions
  - Commit message format
  - Code style guidelines
  - Pull request process

- **[Testing Guide](./TESTING.md)** - Comprehensive testing documentation
  - Running tests
  - Writing tests with TDD
  - Testing patterns and best practices
  - Mocking Firebase services

- **[Architecture Overview](./ARCHITECTURE.md)** - Technical architecture and design decisions
  - Tech stack explanation
  - Project structure
  - Data flow and state management
  - Performance considerations

### Firebase

- **[Firebase Lazy Initialization](./firebase-lazy-init.md)** - Firebase setup and initialization
  - Lazy initialization pattern
  - Environment detection
  - Usage patterns (recommended vs legacy)
  - Testing strategies

- **[Firebase Usage Examples](./firebase-usage-examples.ts)** - Code examples
  - Recommended usage patterns
  - Legacy backward-compatible patterns
  - Testing with mocks
  - Best practices

### Deployment & Performance

- **[Caching Strategy](./CACHING_STRATEGY.md)** - HTTP caching configuration
  - Cache header explanation
  - Content hashing with Vite
  - Deployment flow
  - Performance optimization

## Quick Links

### For New Contributors

```
1. Read: ENVIRONMENT_SETUP.md
2. Read: CONTRIBUTING.md
3. Read: TESTING.md
4. Start coding with TDD!
```

### For Understanding the Codebase

```
1. Read: ARCHITECTURE.md
2. Read: firebase-lazy-init.md
3. Explore: src/ folder
4. Review: Existing tests
```

### Common Tasks

| Task | Documentation |
|------|---------------|
| Set up development environment | [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) |
| Create a feature branch | [CONTRIBUTING.md](./CONTRIBUTING.md) |
| Write tests | [TESTING.md](./TESTING.md) |
| Use Firebase services | [firebase-lazy-init.md](./firebase-lazy-init.md) |
| Submit a pull request | [CONTRIBUTING.md](./CONTRIBUTING.md) |
| Understand project structure | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Configure caching | [CACHING_STRATEGY.md](./CACHING_STRATEGY.md) |

## Documentation Standards

When adding new documentation:

- Use **Markdown** (.md) format
- Include a **table of contents** for long documents
- Add **code examples** where applicable
- Keep it **up-to-date** as code changes
- Use **clear headings** and structure
- Link to **related documentation**

## Need Help?

- **Questions?** Open a [GitHub Discussion](https://github.com/Boelslund/boelslund-planwell-finance/discussions)
- **Documentation unclear?** Open an issue or submit a PR to improve it
- **Found a bug?** Create an [Issue](https://github.com/Boelslund/boelslund-planwell-finance/issues)

## External Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
