# Planwell Finance

A financial tool to eliminate inconsistent spending. Calculates and stabilizes the required monthly savings amount to cover all your variable annual bills with one fixed, predictable set-aside.

## Tech Stack

- **React 18** + **TypeScript** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Firebase** - Authentication, Firestore, Hosting
- **Vitest** + **React Testing Library** - Test-driven development
- **GitHub Actions** - CI/CD pipeline

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
npm run test         # Run tests in watch mode
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

## License

MIT - See [LICENSE](./LICENSE) for details
