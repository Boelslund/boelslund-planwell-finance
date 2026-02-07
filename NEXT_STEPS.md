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

## Testing

Use the [pre-production application](https://boelslund-planwell-finance-dev.web.app/) when testing.

---

## Phase 1: Authentication & User Setup

### 1.1 Firebase Authentication

- [x] Configure Firebase Auth in project
- [x] Create authentication context/provider
- [x] Protected route wrapper component

### 1.2 Registration & Login UI

- [x] Create `Login` component (TDD)
- [x] Create `Register` component (TDD)
- [x] Email/password authentication (implement signIn/signUp/signOut in AuthContext)
- [x] Form validation (email format, password strength)
- [x] Error handling (user already exists, wrong password, etc.)
- [x] Loading states

### 1.3 User Session Management

- [x] Persist authentication state (Firebase handles this automatically)
- [x] Auto-login on page refresh (via onAuthStateChanged)
- [x] Logout functionality (signOut implemented in AuthContext)
- [x] Password reset flow (email link)
- [ ] Email verification

### 1.4 User Profile

- [x] Basic user profile in Firestore (`users/{userId}`)
- [x] Store: email, displayName, createdAt
- [x] Integrate profile creation into registration flow
- [-] Create default budget on first login (moved to Phase 2)
- [ ] User settings/preferences structure

### 1.5 App Layout & Navigation

- [x] Create app layout structure with header/navigation
- [x] Create Layout component with Header and Footer
- [x] Create Header/TopBar component with user info
  - [x] Display user email/name
  - [x] Profile picture placeholder/avatar
  - [x] User menu dropdown with logout button
  - [x] Redirect to landing page after logout
- [x] Create Navigation component
  - [x] Mobile-responsive navigation menu
  - [x] Menu toggle button
  - [x] Conditional links (authenticated/unauthenticated users)
- [x] Create Footer component
  - [x] Copyright information
  - [x] Footer links (Privacy, Terms, Contact)
- [x] Create useMenu custom hook for menu management
- [x] Write unit tests for Header component
- [x] Write unit tests for Footer component
- [x] Write unit tests for Navigation component

### 1.6 Additional Pages & Routes

- [x] Create Privacy Policy page
- [x] Create Terms of Service page
- [x] Create Support/Contact page
- [x] Fix Footer link to Support page (was /contact, now /support)
- [x] Create unit test for Layout component
- [x] Create Loading component with spinner
- [x] Integrate Loading component into Home component
- [x] Add accessibility attributes to Loading component (aria-live, role)
- [x] Support reduced-motion preference in Loading spinner
- [x] Add integration test for Layout wrapper with routing (App.test.tsx)
- [x] Add accessibility tests for navigation keyboard controls
  - [x] Navigation Escape key test
  - [x] Header keyboard navigation tests (Enter, Escape)
- [x] Verify CSS/styling is complete for all layout components
  - [x] Header.css
  - [x] Footer.css
  - [x] Navigation.css
  - [x] Layout.css
  - [x] Loading.css

### Phase 1 Testing Gate

**Manual Testing Required Before Merging to Main:**

#### Happy Path Testing

- [ ] Register new account with valid email/password
- [ ] Verify email validation (invalid formats rejected)
- [ ] Verify password validation (minimum requirements enforced)
- [ ] Login with registered credentials
- [ ] Verify user profile created in Firestore
- [ ] Refresh page - verify user stays logged in
- [ ] Logout successfully
- [ ] Login again with same credentials

#### Error Handling

- [ ] Try registering with existing email (proper error message)
- [ ] Try logging in with wrong password (proper error message)
- [ ] Try logging in with non-existent email (proper error message)
- [ ] Test network failure scenarios (disconnect internet mid-operation)
- [ ] Verify all error messages are user-friendly

#### Cross-Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (if available)
- [ ] Edge (latest)

#### Security & Session

- [ ] Protected routes redirect to login when not authenticated
- [ ] Cannot access login/register when already logged in
- [ ] Session persists across page refreshes
- [ ] Session cleared completely on logout

#### UX & Accessibility

- [ ] All forms have proper labels and placeholders
- [ ] Tab navigation works correctly
- [ ] Loading states display properly
- [ ] Success/error messages are visible and clear
- [ ] Responsive design testing:
  - [ ] Mobile (320px-767px): Navigation hamburger menu works, content readable, forms usable
  - [ ] Tablet (768px-1023px): Layout adjusts properly, navigation transitions correctly
  - [ ] Desktop (1024px+): Full navigation visible, optimal spacing and layout
  - [ ] Test navigation menu toggle on mobile viewport
  - [ ] Verify no horizontal scroll at any breakpoint
  - [ ] Check header user menu displays correctly at all sizes

**🚫 Do not proceed to Phase 2 until all Phase 1 tests pass**

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

### ✅ Phase 2 Testing Gate

**Manual Testing Required Before Proceeding to Phase 3:**

#### Budget CRUD Operations

- [ ] Default budget created automatically on first login
- [ ] Create multiple budgets successfully
- [ ] Rename budget - changes reflect immediately
- [ ] Delete budget with confirmation dialog
- [ ] Cannot delete last remaining budget
- [ ] Switch between budgets - correct data displays

#### Data Isolation

- [ ] Create two test accounts
- [ ] Verify each user only sees their own budgets
- [ ] Verify Firestore security rules prevent unauthorized access

#### Real-time Sync

- [ ] Open same budget in two browser tabs
- [ ] Create budget in tab 1 - appears in tab 2
- [ ] Rename budget in tab 2 - updates in tab 1
- [ ] Delete budget in tab 1 - removes from tab 2

**🚫 Do not proceed to Phase 3 until all Phase 2 tests pass**

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

### ✅ Phase 3 Testing Gate

**Manual Testing Required Before Proceeding to Phase 4:**

#### Expense CRUD

- [ ] Add expense with monthly frequency - saves correctly
- [ ] Add expense with annual frequency - saves correctly
- [ ] Edit expense - changes persist
- [ ] Delete expense - removes from list immediately
- [ ] Add 10+ expenses - list remains performant

#### Data Validation

- [ ] Cannot submit expense with negative amount
- [ ] Cannot submit expense with empty name
- [ ] Decimal amounts work correctly (e.g., $123.45)
- [ ] Very large amounts handled properly (e.g., $999,999.99)

#### Real-time Updates

- [ ] Open budget in two tabs
- [ ] Add expense in tab 1 - appears in tab 2
- [ ] Edit expense in tab 2 - updates in tab 1
- [ ] Delete expense in tab 1 - removes from tab 2

#### User Experience

- [ ] Form clears after successful submission
- [ ] Loading states show during save operations

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

### ✅ Phase 4 Testing Gate (MVP Testing)

**Manual Testing Required - Core Feature Validation:**

#### Calculation Accuracy

- [ ] Add monthly expense ($100) - monthly total shows $100
- [ ] Add annual expense ($1200) - monthly total increases by $100
- [ ] Mix of monthly and annual expenses calculates correctly
- [ ] Very small amounts (e.g., $0.01) calculate correctly
- [ ] Very large amounts (e.g., $10,000/month) calculate correctly

#### Buffer Calculation

- [ ] Buffer amount changes based on current month
- [ ] Buffer accounts for all upcoming annual bills
- [ ] Multiple annual bills with different timings calculated correctly
- [ ] Mid-year calculations are accurate

#### Currency Formatting

- [ ] All amounts display with proper currency symbol
- [ ] Decimal places formatted correctly (2 places)
- [ ] Thousands separators display properly (e.g., $1,234.56)

#### End-to-End Scenario

- [ ] Create new account
- [ ] Add realistic set of expenses (10-15 items)
- [ ] Verify monthly deposit calculation is reasonable
- [ ] Verify buffer amount makes sense
- [ ] Compare manual calculation with app results

**🎯 MVP Complete - Ready for Beta Testing**

- [ ] Error messages display for failed operations
- [ ] Confirmation required before deleting expense

**🚫 Do not proceed to Phase 4 until all Phase 3 tests pass**

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

### ✅ Phase 5 Testing Gate

**Manual Testing Required Before Proceeding to Phase 6:**

#### Visual Representation

- [ ] Chart/graph displays correctly with multiple expenses
- [ ] Chart updates in real-time when expenses added/removed
- [ ] Monthly cash flow visualization is accurate
- [ ] Visual elements are responsive on different screen sizes
- [ ] Progress indicators reflect actual budget health
- [ ] Color coding is intuitive and accessible
- [ ] Charts remain readable with 20+ expenses

#### Bill Due Dates

- [ ] Due date field accepts valid dates
- [ ] Due date validation prevents invalid dates (e.g., past dates)
- [ ] Upcoming bills list shows correct bills for next 30 days
- [ ] Bills are sorted chronologically
- [ ] Warning displays when buffer is insufficient
- [ ] Warning thresholds are accurate
- [ ] Due date changes update upcoming bills immediately

#### Scenarios & What-If

- [ ] "What if" calculator doesn't modify actual budget data
- [ ] Temporary expense adjustments calculate correctly
- [ ] Can compare multiple scenarios side-by-side
- [ ] Reset scenario button restores original data
- [ ] Scenario calculations match actual budget calculations
- [ ] Can save scenarios for future reference

#### User Experience

- [ ] Visual elements enhance understanding (not just decorative)
- [ ] Due date warnings are noticeable but not intrusive
- [ ] Scenario tools are intuitive without instructions
- [ ] Performance remains smooth with visual features enabled
- [ ] All features work on mobile devices

**🚫 Do not proceed to Phase 6 until all Phase 5 tests pass**

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

### ✅ Phase 6 Testing Gate (Multi-User Testing Required)

**Manual Testing Required - Get 2-3 Testers:**

#### Collaboration Flow

- [ ] User A creates budget and invites User B as Editor
  - [ ] User B receives and accepts invitation
  - [ ] User B can see shared budget in their budget list
  - [ ] User B can add/edit/delete expenses
  - [ ] User B cannot delete budget or change collaborators
- [ ] User A invites User C as Viewer
- [ ] User C can see budget but cannot edit anything
- [ ] UI correctly hides edit buttons for User C

#### Permission Changes

- [ ] Owner changes Editor to Viewer - permissions update immediately
- [ ] Owner changes Viewer to Editor - new permissions work immediately
- [ ] Owner removes collaborator - they lose access immediately

#### Security Testing

- [ ] User C (Viewer) attempts direct Firestore write - rejected
- [ ] User D (non-collaborator) cannot access budget
- [ ] Removed collaborator cannot access budget after removal
- [ ] Owner can always access and modify their budget

#### Real-time Collaboration

- [ ] User A and User B both viewing same budget
- [ ] User A adds expense - User B sees it immediately
- [ ] User B edits expense - User A sees update immediately
- [ ] No conflicts or data loss during simultaneous edits

#### Edge Cases

- [ ] Owner transfers ownership to collaborator
- [ ] Original owner now has correct reduced permissions
- [ ] New owner has full control
- [ ] Collaborator leaves shared budget
- [ ] Cannot leave budget if you're the owner

**🚫 Do not deploy to production until all collaboration tests pass**

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

### ✅ Phase 7 Testing Gate

**Manual Testing Required Before Proceeding to Phase 8:**

#### Activity Log & Audit Trail

- [ ] Activity log records all expense changes (add, edit, delete)
- [ ] Activity log shows correct user attribution
- [ ] Timestamps are accurate and timezone-aware
- [ ] Filter by user works correctly
- [ ] Filter by action type works correctly
- [ ] Filter by date range works correctly
- [ ] Version history displays all previous states
- [ ] Restore previous version works correctly
- [ ] Activity feed updates in real-time across devices
- [ ] Performance remains good with 100+ activity entries

#### Notifications

- [ ] Email notification sent when budget is shared
- [ ] Email notification sent when expenses are modified in shared budget
- [ ] Upcoming bill notifications sent at correct time
- [ ] Low buffer warning notifications are accurate
- [ ] In-app notifications appear immediately
- [ ] Notification badge count is accurate
- [ ] Mark as read functionality works
- [ ] Clear all notifications works
- [ ] Notification preferences are respected
- [ ] Can disable specific notification types
- [ ] Email delivery is reliable (check spam folder)

#### Team/Household Features

- [ ] Household budget templates apply correctly
- [ ] Multiple users can contribute to same budget
- [ ] Split expenses calculate correctly
- [ ] Personal vs. shared expense distinction is clear
- [ ] Individual contribution tracking is accurate
- [ ] Contribution history displays correctly
- [ ] Can view each user's contribution total
- [ ] Split expense UI is intuitive

#### Admin Dashboard

- [ ] Dashboard shows all collaborators with correct roles
- [ ] Activity statistics are accurate
- [ ] Bulk permission changes work for multiple users
- [ ] Can change multiple users from Editor to Viewer
- [ ] Can change multiple users from Viewer to Editor
- [ ] Pending invitations list is accurate
- [ ] Accepted invitations show correct timestamp
- [ ] Rejected invitations are tracked
- [ ] Dashboard updates in real-time
- [ ] Performance is good with 10+ collaborators

**🚫 Do not proceed to Phase 8 until all Phase 7 tests pass**

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

### ✅ Phase 8 Testing Gate

**Manual Testing Required Before Pre-Production:**

#### Export & Import

- [ ] Export budget to CSV - file downloads correctly
- [ ] CSV export contains all expense data
- [ ] CSV export formatting is valid (opens in Excel/Google Sheets)
- [ ] Export budget to JSON - file downloads correctly
- [ ] JSON export contains complete budget structure
- [ ] JSON format is valid and readable
- [ ] Import expenses from CSV - success with valid file
- [ ] CSV import handles different delimiters (comma, semicolon)
- [ ] Import expenses from JSON - success with valid file
- [ ] Import validation catches invalid data
- [ ] Import validation catches duplicate entries
- [ ] Import shows preview before confirming
- [ ] Import provides clear error messages for invalid files
- [ ] Large imports (100+ expenses) complete successfully

#### Budget Templates

- [ ] Duplicate budget creates exact copy
- [ ] Duplicated budget has correct name (e.g., "Budget Name (Copy)")
- [ ] All expenses copied correctly
- [ ] Original budget unchanged after duplication
- [ ] Pre-built templates load correctly
- [ ] Household template has appropriate expenses
- [ ] Student template has appropriate expenses
- [ ] Business template has appropriate expenses
- [ ] Can customize template after applying
- [ ] Template sharing (if implemented) works correctly

#### Archive & Backup

- [ ] Archive budget hides it from main list
- [ ] Archived budgets accessible from archive section
- [ ] Restore archived budget works correctly
- [ ] Restored budget appears in main list
- [ ] Cannot accidentally delete archived budgets
- [ ] Backup notification displays appropriately
- [ ] Download all data (GDPR) includes all user information
- [ ] Download all data includes all budgets and expenses
- [ ] Downloaded data is in readable format
- [ ] Downloaded data can be used for manual backup

#### Bulk Operations

- [ ] Select multiple expenses with checkboxes
- [ ] Select all functionality works
- [ ] Deselect all functionality works
- [ ] Bulk delete removes all selected expenses
- [ ] Bulk delete shows confirmation dialog
- [ ] Bulk delete can be cancelled
- [ ] Bulk edit changes frequency for all selected
- [ ] Bulk edit changes category/tags for all selected
- [ ] Bulk operations work with 50+ selected expenses
- [ ] Undo bulk operations if possible
- [ ] Clear visual feedback for selected items

#### Data Integrity

- [ ] Import doesn't corrupt existing data
- [ ] Export-import roundtrip preserves all data
- [ ] Bulk operations maintain data consistency
- [ ] Archive-restore doesn't lose any data
- [ ] Template application doesn't affect other budgets

**🚫 Do not proceed to Pre-Production Testing until all Phase 8 tests pass**

---

## Pre-Production Testing Gate

**Final Testing Before Public Launch:**

#### Performance Testing

- [ ] Load test with 50+ expenses in single budget
- [ ] Test app with 10+ budgets per user
- [ ] Measure page load times (< 3 seconds)
- [ ] Test with slow network (3G simulation)
- [ ] Monitor Firestore read/write quotas

#### Mobile Testing

- [ ] Test on actual iOS device (iPhone)
- [ ] Test on actual Android device
- [ ] Test various screen sizes (small, medium, large)
- [ ] Verify touch targets are appropriately sized
- [ ] Test portrait and landscape orientations

#### Accessibility Audit

- [ ] Screen reader testing (NVDA/JAWS/VoiceOver)
- [ ] Keyboard-only navigation
- [ ] Color contrast validation (WCAG AA)
- [ ] Focus indicators visible
- [ ] All images have alt text

#### Security Audit

- [ ] Review all Firestore security rules
- [ ] Test unauthorized access attempts
- [ ] Verify sensitive data not exposed in logs
- [ ] Check for XSS vulnerabilities
- [ ] Verify authentication tokens handled securely
- [ ] Verify authentication tokens handled securely

#### User Acceptance Testing

- [ ] 5-10 beta testers use app for 1 week
  - [ ] Collect feedback on usability
  - [ ] Identify confusing UI elements
- [ ] Verify core features solve real problems
- [ ] Address critical feedback before launch

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

### 9.4 Enhanced Authentication UX

- [ ] Password strength meter (visual indicator: weak/medium/strong)
- [ ] Remember me option
- [ ] Social login (Google, GitHub)

---

## Technical Debt & Improvements

- [ ] Add loading states for async operations
- [ ] Error handling and user feedback
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Performance optimization
- [ ] Comprehensive test coverage (>80%)
- [ ] Documentation for components

---

## Post-Launch Security & Quality Enhancements

### Priority: High (After First Production Release)

- [ ] **SonarCloud Integration** - Deep code quality and security analysis
  - Sign up at [sonarcloud.io](https://sonarcloud.io)
  - Connect to GitHub repository
  - Add SonarCloud status check to rulesets
  - Review and fix identified issues

- [ ] **Codecov Integration** - Track test coverage metrics
  - Sign up at [codecov.io](https://codecov.io)
  - Add coverage reporting to test workflow
  - Set minimum coverage thresholds
  - Review coverage on every PR

### Priority: Medium (Nice to Have)

- [ ] **Enhanced CodeQL Queries** - Enable more comprehensive security scans
  - Go to Settings → Code security and analysis → Code scanning
  - Click "Edit configuration" for CodeQL
  - Enable extended security queries in the configuration
  - Review and fix new findings

- [ ] **Snyk Integration** - Alternative/additional dependency scanning
  - Consider if Dependabot isn't sufficient
  - More detailed vulnerability information
  - Container and infrastructure scanning

- [ ] **Performance Monitoring** - Track real-world performance
  - Firebase Performance Monitoring
  - Web Vitals tracking
  - Error tracking (Sentry or similar)

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
