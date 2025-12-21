# Architecture Overview

This document describes the technical architecture and design decisions for Boelslund PlanWell Finance.

## Tech Stack

### Frontend
- **React 18** - UI library with concurrent features
- **TypeScript** - Type safety and better DX
- **Vite** - Fast build tool and dev server
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
│   ├── features/         # Feature-specific code (future)
│   ├── hooks/            # Custom React hooks (future)
│   ├── utils/            # Helper functions (future)
│   ├── types/            # Shared TypeScript types (future)
│   ├── config/           # Configuration files
│   │   └── firebase.config.ts
│   ├── test/             # Test setup and utilities
│   │   └── setup.ts
│   ├── App.tsx           # Root component
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

#### Current Approach (MVP)
- **Component State** - `useState` for local UI state
- **Firebase State** - Real-time listeners for data

#### Future Considerations
As the app grows, consider:
- **React Context** - For shared state (auth, active budget)
- **State Management Library** - Redux, Zustand, or Jotai (if needed)

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
   - Page structure
   - Navigation
   - Responsive design

**Example:**

```typescript
// Presentation Component
function ExpenseCard({ expense, onDelete }: ExpenseCardProps) {
  return (
    <div className="expense-card">
      <h3>{expense.name}</h3>
      <p>${expense.amount}</p>
      <button onClick={() => onDelete(expense.id)}>Delete</button>
    </div>
  )
}

// Container Component
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
  
  const handleDelete = async (id: string) => {
    const db = getDbInstance()
    await deleteDoc(doc(db, 'expenses', id))
  }
  
  return (
    <div>
      {expenses.map(expense => (
        <ExpenseCard key={expense.id} expense={expense} onDelete={handleDelete} />
      ))}
    </div>
  )
}
```

## Data Model

### Firestore Schema

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
