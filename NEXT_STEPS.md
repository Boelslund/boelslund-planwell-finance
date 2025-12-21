# Development Roadmap

## Core Goal
Enable users to calculate:
1. **How much money should be in their budget account right now** (the account bills are paid from)
2. **The fixed monthly deposit amount** needed to ensure all bills can always be paid

### Multi-User Support
- **User accounts** with authentication
- **Multiple budgets** per user (personal, household, business)
- **Budget sharing** with role-based access control (Owner, Editor, Viewer)
- **Collaboration** for shared household/family budgets

---

## Phase 1: Authentication & User Setup

### 1.1 Firebase Authentication
- [x] Configure Firebase Auth in project
- [x] Create authentication context/provider
- [ ] Protected route wrapper component

### 1.2 Registration & Login UI
- [ ] Create `Login` component (TDD)
- [ ] Create `Register` component (TDD)
- [ ] Email/password authentication
- [ ] Form validation (email format, password strength)
- [ ] Error handling (user already exists, wrong password, etc.)
- [ ] Loading states

### 1.3 User Session Management
- [ ] Persist authentication state
- [ ] Auto-login on page refresh
- [ ] Logout functionality
- [ ] Password reset flow (email link)
- [ ] Email verification (optional for MVP)

### 1.4 User Profile
- [ ] Basic user profile in Firestore (`users/{userId}`)
- [ ] Store: email, displayName, createdAt
- [ ] Create default budget on first login
- [ ] User settings/preferences structure

---

## Phase 2: Budget Management & Data Structure

### 2.1 Firestore Schema Design
- [ ] Design and document schema:
  ```
  users/{userId}/
    ├── profile (name, email, settings)
    └── budgets/{budgetId}/
        ├── metadata (name, description, createdAt, owner)
        └── expenses/{expenseId}
  ```
- [ ] Create Firestore security rules
- [ ] Test rules for data isolation

### 2.2 Budget CRUD Operations
- [ ] Create `Budget` TypeScript interface/type
- [ ] Create default budget on user registration
- [ ] List user's budgets
- [ ] Create new budget
- [ ] Rename/edit budget
- [ ] Delete budget (with confirmation)
- [ ] Set active budget (in context/state)

### 2.3 Budget Selector UI
- [ ] Budget selector dropdown/menu component
- [ ] Show active budget name
- [ ] Switch between budgets
- [ ] "Create new budget" button
- [ ] Budget management page/modal

---

## Phase 3: Expense Input & Management

### 3.1 Add Expense Form
- [ ] Create `ExpenseForm` component (TDD)
- [ ] Input fields: expense name, amount, frequency (monthly/annual)
- [ ] Form validation (positive numbers, required fields)
- [ ] Add button to submit expense
- [ ] Save to Firestore: `budgets/{budgetId}/expenses/{expenseId}`

### 3.2 Expense List Display
- [ ] Create `ExpenseList` component (TDD)
- [ ] Real-time listener for expenses in active budget
- [ ] Display all expenses in table/list
- [ ] Show: name, amount, frequency, calculated monthly cost
- [ ] Delete button for each expense
- [ ] Edit expense functionality

### 3.3 Expense Operations
- [ ] Create expense (to Firestore)
- [ ] Update expense
- [ ] Delete expense
- [ ] Real-time sync across devices
- [ ] Optimistic UI updates
- [ ] Error handling for failed operations

---

## Phase 4: Budget Calculation Engine

### 4.1 Monthly Calculation Logic
- [ ] Create `calculateMonthlyAmount` utility function (TDD)
- [ ] Convert annual expenses to monthly (amount / 12)
- [ ] Sum all monthly amounts
- [ ] Handle different frequencies (monthly, annual, quarterly, etc.)

### 4.2 Buffer Amount Calculation
- [ ] Determine current month's position in year
- [ ] Calculate how many months until next annual bills
- [ ] Determine required buffer in account
- [ ] Account for multiple bills with different due dates

### 4.3 Results Display
- [ ] Create `BudgetSummary` component (TDD)
- [ ] Show: Total monthly expenses
- [ ] Show: Required fixed monthly deposit
- [ ] Show: Current buffer needed in account
- [ ] Clear, readable formatting (currency)

---

## Phase 5: Enhanced Features

### 5.1 Visual Representation
- [ ] Add chart/graph showing expense breakdown
- [ ] Monthly cash flow visualization
- [ ] Progress indicator for budget health

### 5.2 Bill Due Dates
- [ ] Add due date field to expenses
- [ ] Show upcoming bills (next 30 days)
- [ ] Warning if buffer is insufficient for upcoming bills

### 5.3 Scenarios & What-If
- [ ] "What if I add this expense?" calculator
- [ ] Adjust expenses temporarily to see impact
- [ ] Compare different expense scenarios

---

## Phase 6: Budget Sharing & Collaboration (RBAC)

### 6.1 Add Collaborators
- [ ] Add collaborators to budget by email
- [ ] Send email invitation (Firebase or custom)
- [ ] Accept/decline invitation flow
- [ ] Pending invitations list

### 6.2 Role-Based Access Control
- [ ] Define roles:
  - **Owner**: Full control (edit, delete, share, transfer ownership)
  - **Editor**: Can add/edit/delete expenses
  - **Viewer**: Read-only access
- [ ] Store roles in budget metadata: `collaborators: [{ userId, role, addedAt }]`
- [ ] Enforce permissions in UI (hide edit buttons for viewers)
- [ ] Enforce permissions in Firestore security rules

### 6.3 Collaboration UI
- [ ] Show collaborators list in budget settings
- [ ] Edit collaborator role (owner only)
- [ ] Remove collaborator (owner only)
- [ ] Leave shared budget (non-owners)
- [ ] Transfer ownership
- [ ] Shared budget indicator/badge in budget list

### 6.4 Firestore Security Rules for RBAC
- [ ] Rules: Users can only read budgets they own or collaborate on
- [ ] Rules: Only owners can modify budget metadata
- [ ] Rules: Editors and owners can modify expenses
- [ ] Rules: Viewers can only read
- [ ] Test all permission scenarios

---

## Phase 7: Advanced Collaboration & Admin Features

### 7.1 Activity Log & Audit Trail
- [ ] Track all changes (who, what, when)
- [ ] Activity feed per budget
- [ ] Filter by user, action type, date
- [ ] Restore previous versions (expense history)

### 7.2 Notifications
- [ ] Email notifications for:
  - Budget shared with you
  - Changes to shared budgets
  - Upcoming bills (if due dates enabled)
  - Low buffer warnings
- [ ] In-app notifications
- [ ] Notification preferences per user

### 7.3 Team/Household Features
- [ ] Household/family budget templates
- [ ] Multiple users contributing to same budget
- [ ] Split expenses between users
- [ ] Personal expenses vs. shared expenses
- [ ] Individual contribution tracking

### 7.4 Admin Dashboard (for Budget Owners)
- [ ] View all collaborators and their roles
- [ ] Activity statistics
- [ ] Bulk permission changes
- [ ] Invitation management (pending, accepted, rejected)

---

## Phase 8: Data Management & Export

### 8.1 Export & Import
- [ ] Export budget to CSV
- [ ] Export budget to JSON
- [ ] Import expenses from CSV
- [ ] Import expenses from JSON
- [ ] Validation on import

### 8.2 Budget Templates
- [ ] Duplicate budget (as template)
- [ ] Pre-built templates (household, student, business)
- [ ] Share template with community (optional)

### 8.3 Archive & Backup
- [ ] Archive old budgets (hide from main list)
- [ ] Restore archived budgets
- [ ] Automatic backup notifications
- [ ] Download all data (GDPR compliance)

### 8.4 Bulk Operations
- [ ] Select multiple expenses
- [ ] Bulk delete
- [ ] Bulk edit (change frequency, etc.)
- [ ] Bulk tag/categorize

---

## Phase 9: Polish & UX

### 9.1 Responsive Design
- [ ] Mobile-friendly layout
- [ ] Tablet optimization
- [ ] Desktop layout

### 9.2 Onboarding
- [ ] Welcome screen with explanation
- [ ] Sample data for first-time users
- [ ] Tutorial/help section

### 9.3 Settings & Preferences
- [ ] Currency selection
- [ ] Date format preferences
- [ ] Theme (light/dark mode)

---

## Technical Debt & Improvements

- [ ] Add loading states for async operations
- [ ] Error handling and user feedback
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Performance optimization
- [ ] Comprehensive test coverage (>80%)
- [ ] Documentation for components

---

## Current Status

**✅ Completed:**
- Project setup (React + TypeScript + Vite)
- Testing framework (Vitest + React Testing Library)
- Firebase configuration structure
- CI/CD pipeline (GitHub Actions)
- Sample Counter component with tests

**🎯 Next Up:**
1. Set up Firebase Authentication
2. Create Login/Register components (TDD)
3. Build authentication context
4. Create protected routes

---

## Development Workflow Reminder

```bash
# 1. Write failing test first
npm run test

# 2. Implement feature to pass test
npm run dev

# 3. Verify all tests pass
npm run test

# 4. Commit
git add .
git commit -m "feat: add expense form component"

# 5. Push to feature branch, create PR to test branch
```

**Test-Driven Development:** Always write the test before the implementation!
