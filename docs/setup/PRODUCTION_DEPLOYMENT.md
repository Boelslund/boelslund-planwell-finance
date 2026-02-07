# Production Deployment Checklist

## Firebase Console Setup (Production Project)

### 1. Create Production Firebase Project

- [ ] Go to [Firebase Console](https://console.firebase.google.com/)
- [ ] Create a new project for production (or use existing production project)
- [ ] Enable Google Analytics (optional but recommended)

### 2. Enable Firebase Authentication

- [ ] Navigate to **Authentication** in Firebase Console
- [ ] Click **Get Started**
- [ ] Go to **Sign-in method** tab
- [ ] Enable **Email/Password** provider
- [ ] **Important**: Consider enabling email verification in production (optional for now, but recommended)
  - Can be added in Phase 1.3 later

### 3. Create Firestore Database

- [ ] Navigate to **Firestore Database** in Firebase Console
- [ ] Click **Create database**
- [ ] Choose **Start in production mode** (rules will block all access initially)
- [ ] Select your preferred database location (choose closest to your users)
  - Note: Database location cannot be changed after creation
  - Recommended: `europe-west1` (Belgium) or your preferred region

### 4. Deploy Firestore Security Rules

- [ ] In Firestore Console, go to **Rules** tab
- [ ] Copy the rules from `firestore.rules` in your repository
- [ ] Paste into the Firebase Console rules editor
- [ ] Click **Publish**
- [ ] Verify rules are active (should show published timestamp)

**Rules to deploy (from firestore.rules):**

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }

    // Helper function to check if the authenticated user matches the userId
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // User profiles - users can read/write their own profile
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId);
      allow update: if isOwner(userId);
      allow delete: if isOwner(userId);

      // Budgets subcollection
      match /budgets/{budgetId} {
        allow read: if isOwner(userId);
        allow write: if isOwner(userId);

        // Expenses subcollection
        match /expenses/{expenseId} {
          allow read: if isOwner(userId);
          allow write: if isOwner(userId);
        }
      }
    }

    // Default deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 5. Get Production Firebase Configuration

- [ ] In Firebase Console, go to **Project Settings** (gear icon)
- [ ] Scroll down to **Your apps** section
- [ ] If no web app exists, click **Add app** → select **Web** (</> icon)
- [ ] Register app with a nickname (e.g., "PlanWell Finance Production")
- [ ] Copy the Firebase configuration object

### 6. Configure Production Environment Variables

Create a `.env.production.local` file (this file is gitignored):

```env
VITE_FIREBASE_API_KEY=your_production_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-production-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-production-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-production-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_production_sender_id
VITE_FIREBASE_APP_ID=your_production_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_production_measurement_id
```

**Important Notes:**

- Never commit `.env.production.local` to version control
- Use different Firebase projects for development and production
- The API key is safe to expose in client-side code (it's protected by Firestore rules)

### 7. Set Up Firebase Hosting (Production)

- [ ] In Firebase Console, go to **Hosting**
- [ ] Click **Get started**
- [ ] Follow the setup wizard (Firebase CLI should already be installed)
- [ ] Add production site:
  ```bash
  firebase target:apply hosting production your-production-site-name
  ```
- [ ] Deploy to production:
  ```bash
  npm run build
  firebase deploy --only hosting:production
  ```

### 8. Configure Custom Domain (Optional)

- [ ] In Firebase Hosting, click **Add custom domain**
- [ ] Follow the instructions to verify domain ownership
- [ ] Add DNS records as instructed by Firebase
- [ ] Wait for SSL certificate provisioning (can take 24-48 hours)

### 9. Set Up Firebase Authentication Settings

- [ ] Go to **Authentication** → **Settings** tab
- [ ] **Authorized domains**: Add your production domain
- [ ] **Email verification template** (optional): Customize if enabling email verification
- [ ] **Password reset template** (optional): Customize if implementing password reset

### 10. Enable Firebase App Check (Recommended for Production)

- [ ] Go to **App Check** in Firebase Console
- [ ] Register your web app
- [ ] Choose reCAPTCHA v3 or reCAPTCHA Enterprise
- [ ] Enforce App Check for Firestore (consider starting in monitor mode first)

## Pre-Deployment Testing

### 1. Test with Production Configuration Locally

- [ ] Create `.env.production.local` with production Firebase config
- [ ] Run production build: `npm run build`
- [ ] Test production build locally: `npm run preview`
- [ ] Verify authentication works
- [ ] Verify user profile creation works
- [ ] Check browser console for errors

### 2. Run All Tests

- [ ] Run test suite: `npm test -- --run --coverage`
- [ ] Verify all 91 tests pass
- [ ] Verify 100% coverage maintained

### 3. TypeScript & Linting

- [ ] No TypeScript errors: Check Problems panel in VS Code
- [ ] Run build: `npm run build` (should complete without errors)

## Deployment Commands

### Initial Production Deployment

```bash
# Build production bundle
npm run build

# Deploy to Firebase Hosting (production)
firebase deploy --only hosting:production

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

### Update Deployment

```bash
# Build and deploy
npm run build
firebase deploy --only hosting:production
```

## Post-Deployment Verification

### 1. Smoke Tests

- [ ] Visit production URL
- [ ] Register a new test account
- [ ] Verify user profile created in Firestore (check Firebase Console)
- [ ] Log out
- [ ] Log back in
- [ ] Verify session persistence (refresh page while logged in)

### 2. Monitoring

- [ ] Set up Firebase Performance Monitoring (optional)
- [ ] Set up Firebase Crashlytics for web (optional)
- [ ] Monitor Firebase Console for authentication errors
- [ ] Check Firebase Usage & Billing tab

## Security Best Practices

### 1. Firestore Rules Review

- [ ] Test rules with Firebase Console Rules Playground
- [ ] Verify users can only access their own data
- [ ] Verify unauthenticated users cannot read/write anything

### 2. Authentication Security

- [ ] Consider enabling email verification for new users
- [ ] Implement password reset flow (Phase 1.3 optional feature)
- [ ] Monitor suspicious authentication patterns
- [ ] Set up rate limiting if needed (Firebase has built-in protection)

### 3. Environment Variables

- [ ] Ensure `.env.production.local` is in `.gitignore`
- [ ] Never commit Firebase config to public repository
- [ ] Use different Firebase projects for dev/test/production

## Maintenance

### Regular Tasks

- [ ] Monitor Firebase quotas and usage
- [ ] Review Firestore security rules as features are added
- [ ] Keep Firebase SDK dependencies updated
- [ ] Review authentication logs for security issues
- [ ] Back up Firestore data regularly (use Firebase Console export feature)

### Cost Management

- [ ] Monitor Firebase billing dashboard
- [ ] Set up budget alerts in Google Cloud Console
- [ ] Review usage patterns monthly
- [ ] Consider upgrading to Blaze plan only when needed

## Rollback Plan

If deployment fails or issues are discovered:

1. **Revert Hosting Deployment:**

   ```bash
   firebase hosting:rollback --only hosting:production
   ```

2. **Revert Firestore Rules:**

   - Go to Firebase Console → Firestore → Rules
   - View rules history
   - Restore previous version

3. **Quick Fix:**
   ```bash
   # Fix the issue locally
   npm run build
   firebase deploy --only hosting:production
   ```

## Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Status Page](https://status.firebase.google.com/)
- [Firebase Support](https://firebase.google.com/support)
- [Stack Overflow - Firebase Tag](https://stackoverflow.com/questions/tagged/firebase)

---

## Quick Reference

**Current Development Setup:**

- Test Firebase project configured
- Email/Password authentication enabled
- Firestore database created
- Security rules deployed
- `.env.local` configured

**Ready for Production When:**

- All features in Phase 1 are complete and tested
- Production Firebase project is set up
- Custom domain (if applicable) is configured
- Load testing completed (if expecting high traffic)
