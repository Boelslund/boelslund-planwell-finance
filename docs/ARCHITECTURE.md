# Architecture Overview

This document describes the technical architecture and design decisions for Boelslund PlanWell Finance.

## Tech Stack

### Frontend
- **React 19** - UI library with latest features
- **React Router 7** - Client-side routing
- **TypeScript** - Type safety and better DX
- **Vite 7** - Fast build tool and dev server
- **CSS** - Vanilla CSS (no framework dependencies)

### Backend/Services
- **Firebase Authentication** - User management and auth
- **Cloud Firestore** - NoSQL database for real-time data
- **Firebase Hosting** - Static site hosting and CDN

### Development Tools
- **Vitest** - Unit testing framework
- **React Testing Library** - Component testing
- **ESLint** - Code quality and consistency
- **GitHub Actions** - CI/CD automation

## Project Structure

```
boelslund-planwell-finance/
├── .github/              # GitHub Actions workflows
├── docs/                 # Documentation
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── auth/         # Authentication components
│   │   │   ├── SignIn.tsx
│   │   │   ├── SignUp.tsx
│   │   │   ├── PasswordReset.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── common/       # Common UI components
│   │   │   └── Loading.tsx
│   │   ├── layout/       # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── Layout.tsx
│   │   └── legal/        # Legal pages
│   │       ├── Privacy.tsx
│   │       ├── Terms.tsx
│   │       └── Support.tsx
│   ├── contexts/         # React Context providers
│   │   └── AuthContext.tsx
│   ├── hooks/            # Custom React hooks
│   │   └── useMenu.ts
│   ├── pages/            # Page components
│   │   ├── Home.tsx
│   │   └── Dashboard.tsx
│   ├── services/         # Business logic and API calls
│   │   └── userProfile.ts
│   ├── config/           # Configuration files
│   │   └── firebase.config.ts
│   ├── test/             # Test setup and utilities
│   │   ├── setup.ts
│   │   ├── test-utils.tsx
│   │   └── suites/       # Test suite helpers
│   ├── App.tsx           # Root component with routing
│   ├── main.tsx          # Application entry point
│   └── firebase.ts       # Firebase initialization
├── .env.example          # Environment variable template
├── firebase.json         # Firebase configuration
├── vite.config.ts        # Vite configuration
└── package.json          # Dependencies and scripts
```

## Core Concepts

### Firebase Integration

#### Lazy Initialization

Firebase services use lazy initialization to prevent errors in test and SSR environments:

```typescript
// Services are only initialized when first accessed
const auth = getAuthInstance()  // Initializes auth on first call
const db = getDbInstance()      // Initializes Firestore on first call
```

**Benefits:**
- No initialization in test environments
- SSR compatible
- Faster initial load
- Better error handling

See [firebase-lazy-init.md](./firebase-lazy-init.md) for details.

#### Environment Variable Validation

Firebase configuration validates required environment variables at startup:

```typescript
// Throws clear error if variables are missing
validateFirebaseConfig()
```

This provides early feedback if the environment is misconfigured.

### Data Flow

```
User Input → React Component → Firebase Service → Firestore
                     ↓                    ↓
                  Local State       Real-time Updates
                     ↓                    ↓
                UI Re-render ←──────────────
```

#### Real-time Updates

Firestore provides real-time data synchronization:

```typescript
// Subscribe to changes
const unsubscribe = onSnapshot(
  collection(db, 'expenses'),
  (snapshot) => {
    const expenses = snapshot.docs.map(doc => doc.data())
    setExpenses(expenses)
  }
)

// Cleanup on unmount
return () => unsubscribe()
```

### State Management

#### Current Approach
- **Component State** - `useState` for local UI state
- **Firebase State** - Real-time listeners for data
- **React Context** - `AuthContext` for global authentication state

#### AuthContext Implementation

The app uses React Context for authentication state management:

```typescript
// AuthContext provides:
- user: User | null              // Current authenticated user
- loading: boolean               // Auth initialization state
- signIn(email, password)        // Sign in method
- signUp(email, password)        // Registration method
- signOut()                      // Sign out method
- resetPassword(email)           // Password reset method
```

**Benefits:**
- Centralized auth state
- Automatic re-renders on auth changes
- Type-safe auth methods
- Easy access via `useAuth()` hook

#### Future Considerations
As the app grows, consider:
- **Additional Context** - Budget context, theme context
- **State Management Library** - Redux, Zustand, or Jotai (if complex state interactions arise)

### Component Architecture

#### Component Types

1. **Presentation Components**
   - Pure UI rendering
   - Receive data via props
   - No business logic or Firebase calls
   - Highly testable

2. **Container Components**
   - Handle data fetching
   - Manage local state
   - Connect to Firebase
   - Pass data to presentation components

3. **Layout Components**
   - Page structure and navigation
   - Responsive design
   - Examples: `Layout`, `Header`, `Footer`, `Navigation`

4. **Page Components**
   - Route-level components
   - Coordinate multiple components
   - Examples: `Home`, `Dashboard`

5. **Auth Components**
   - Authentication flows
   - Protected routes
   - Examples: `SignIn`, `SignUp`, `PasswordReset`, `ProtectedRoute`

**Example:**

```typescript
// Auth Component with Context
import { useAuth } from '../../contexts/AuthContext'

function SignIn() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (error) {
      // Handle error
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Sign In</button>
    </form>
  )
}

// Protected Route Component
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) return <Loading />
  if (!user) return <Navigate to="/signin" />
  
  return <>{children}</>
}

// Future: Container Component for Expenses
function ExpenseList() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  
  useEffect(() => {
    const db = getDbInstance()
    const unsubscribe = onSnapshot(
      collection(db, 'expenses'),
      (snapshot) => setExpenses(snapshot.docs.map(doc => doc.data()))
    )
    return () => unsubscribe()
  }, [])
  
  return (
    <div>
      {expenses.map(expense => (
        <ExpenseCard key={expense.id} expense={expense} />
      ))}
    </div>
  )
}
```

### Routing

The app uses React Router v7 for client-side routing:

```typescript
// Current Routes
/                    → Home (landing page)
/signin              → SignIn (authentication)
/signup              → SignUp (registration)
/password-reset      → PasswordReset (password recovery)
/dashboard           → Dashboard (protected route)
/privacy             → Privacy (legal page)
/terms               → Terms (legal page)
/support             → Support (legal page)
```

**Route Protection:**
- Public routes: Home, SignIn, SignUp, PasswordReset, Legal pages
- Protected routes: Dashboard (requires authentication)
- All routes wrapped in `Layout` component for consistent UI

**Navigation Flow:**
1. Unauthenticated users see Home with sign-in options
2. Sign-in/up redirects to Dashboard on success
3. Protected routes redirect to SignIn if not authenticated
4. Layout provides consistent header/footer/navigation

## Data Model

### Firestore Schema (Planned) (Planned)

The following schema is planned for future implementation:

```
users/{userId}
  ├── email: string
  ├── displayName: string
  ├── createdAt: timestamp
  └── settings: object

budgets/{budgetId}
  ├── name: string
  ├── description: string
  ├── ownerId: string (ref to users)
  ├── createdAt: timestamp
  └── members: array<{userId, role}>

budgets/{budgetId}/expenses/{expenseId}
  ├── name: string
  ├── amount: number
  ├── frequency: "monthly" | "annual"
  ├── category: string (optional)
  ├── dueDate: string (optional, "MM-DD")
  └── createdAt: timestamp
```

**Current State:**
- Authentication is fully implemented
- User profiles are stored via Firebase Auth
- Budget and expense models are not yet implemented

### Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Budget access based on ownership or membership
    match /budgets/{budgetId} {
      allow read: if request.auth.uid in resource.data.members;
      allow write: if request.auth.uid == resource.data.ownerId;
      
      // Expenses within budget
      match /expenses/{expenseId} {
        allow read, write: if request.auth.uid in get(/databases/$(database)/documents/budgets/$(budgetId)).data.members;
      }
    }
  }
}
```

## Testing Strategy

### Test Pyramid

```
        /\
       /  \
      / E2E \       ← Future: Playwright/Cypress
     /______\
    /        \
   / Integr.  \    ← Component integration tests
  /____________\
 /              \
/   Unit Tests   \  ← Current focus: Components, utils
__________________
```

### Current Testing

- **Unit Tests** - All components and utilities
- **Integration Tests** - Multi-component interactions
- **Mocking** - Firebase services mocked in tests

### Future Testing

- **End-to-End Tests** - Full user flows with Playwright
- **Visual Regression** - Screenshot comparison
- **Performance Testing** - Load time monitoring

## Performance Considerations

### Code Splitting

Vite automatically code-splits routes (future implementation):

```typescript
const ExpensePage = lazy(() => import('./features/expenses/ExpensePage'))
```

### Firebase Optimization

- **Pagination** - Limit query results
- **Indexes** - Create composite indexes for complex queries
- **Caching** - Use Firestore's built-in caching

```typescript
// Paginated query
const q = query(
  collection(db, 'expenses'),
  orderBy('createdAt', 'desc'),
  limit(20)
)
```

### Bundle Size

Monitor bundle size with:

```bash
npm run build
```

Vite shows chunk sizes in build output.

## Security

### Authentication Flow

```
1. User enters credentials
2. Firebase Auth validates
3. Auth token stored in memory
4. Token included in Firestore requests
5. Security rules validate token
6. Data returned to client
```

### Security Rules Testing

```bash
# Install Firebase emulator
npm install -g firebase-tools

# Run emulator with security rules
firebase emulators:start --only firestore

# Test rules in your code
```

### Environment Variables

- **Client-safe** - Firebase config can be public
- **No secrets** - Never store API keys or passwords in client code
- **Security in rules** - Protection comes from Firestore security rules

## Deployment

### Firebase Hosting

```bash
# Build production bundle
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

### CI/CD Pipeline

GitHub Actions automatically:
1. Runs tests on every push
2. Checks linting
3. Builds the app
4. Deploys to Firebase (on main branch)

See `.github/workflows/` for configuration.

## Future Architecture Considerations

### Scalability

- **Cloud Functions** - Backend logic for complex operations
- **Cloud Storage** - User file uploads (receipts, etc.)
- **BigQuery** - Analytics and reporting on large datasets

### Internationalization

- **i18n** - Add translation support with react-i18next
- **Currency** - Multi-currency support
- **Localization** - Date/number formatting

### Progressive Web App

- **Service Worker** - Offline support
- **App Manifest** - Install on home screen
- **Push Notifications** - Expense reminders

## Resources

- [React Documentation](https://react.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
