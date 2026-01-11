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
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:ci      # Run tests with coverage (CI)
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage
npm run lint         # Run ESLint
```

## Project Structure

```
src/
├── components/      # React components
├── config/          # Configuration files
├── test/            # Test setup
├── App.tsx          # Main app component
└── main.tsx         # Entry point
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

- **[Environment Setup](./docs/ENVIRONMENT_SETUP.md)** - Complete setup guide
- **[Contributing](./docs/CONTRIBUTING.md)** - Development workflow
- **[Testing](./docs/TESTING.md)** - Testing guide and TDD practices
- **[Versioning](./docs/VERSIONING.md)** - Automated semantic versioning with PR labels
- **[Architecture](./docs/ARCHITECTURE.md)** - Technical architecture overview
- **[Firebase](./docs/firebase-lazy-init.md)** - Firebase integration details

## License

MIT - See [LICENSE](./LICENSE) for details
