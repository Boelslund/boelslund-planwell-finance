# Boelslund PlanWell Finance

A financial tool to eliminate inconsistent spending. Calculates and stabilizes the required monthly savings amount to cover all your variable annual bills with one fixed, predictable set-aside.

## Tech Stack

- **React 18** + **TypeScript** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Firebase** - Authentication, Firestore, Hosting
- **Vitest** + **React Testing Library** - Test-driven development
- **GitHub Actions** - CI/CD pipeline

## Prerequisites

- **Node.js** >= 20.0.0 (required by react-router-dom v7.11.0)
- **npm** or **yarn** package manager

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
# Edit .env.local with your Firebase config

# Start development server
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

## Available Commands

```bash
npm run dev           # Start dev server
npm run build         # Build for production
npm run preview       # Preview production build
npm test              # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:ci       # Run tests with coverage (CI)
npm run test:ui       # Run tests with UI
npm run test:coverage # Run tests with coverage
npm run lint          # Run ESLint
```

## Project Structure

```
src/
├── components/           # React components
│   ├── auth/            # Authentication (SignIn, SignUp, PasswordReset)
│   ├── common/          # Shared components (Loading)
│   ├── layout/          # Layout components (Header, Footer, Navigation)
│   └── legal/           # Legal pages (Privacy, Terms, Support)
├── contexts/            # React contexts (AuthContext)
├── pages/               # Page components (Home, Dashboard)
├── services/            # Business logic & API calls
├── hooks/               # Custom React hooks
├── config/              # Configuration files
├── test/                # Test utilities and shared suites
│   ├── suites/         # Reusable test suites
│   └── test-utils.tsx  # Testing helpers
├── App.tsx              # Main app component
└── main.tsx             # Entry point
```

## Development Roadmap

See [NEXT_STEPS.md](./NEXT_STEPS.md) for the feature development plan:

- Expense input & management
- Budget calculation engine
- Visual representations
- User accounts & persistence
- Current progress & next tasks

## Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) folder:

- **[Environment Setup](./docs/setup/ENVIRONMENT_SETUP.md)** - Complete setup guide
- **[Contributing](./docs/CONTRIBUTING.md)** - Development workflow and branch strategy
- **[Testing](./docs/TESTING.md)** - Testing guide and TDD practices
- **[Versioning](./docs/VERSIONING.md)** - Automated semantic versioning with PR labels
- **[Architecture](./docs/ARCHITECTURE.md)** - Technical architecture overview
- **[Caching Strategy](./docs/CACHING_STRATEGY.md)** - Firebase caching and optimization
- **[Firebase Integration](./docs/firebase-lazy-init.md)** - Lazy initialization pattern

## License

MIT - See [LICENSE](./LICENSE) for details
