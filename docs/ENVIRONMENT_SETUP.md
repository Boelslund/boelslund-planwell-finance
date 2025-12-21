# Environment Setup Guide

This guide walks you through setting up your development environment for Boelslund PlanWell Finance.

## Prerequisites

- **Node.js** 18+ and npm
- **Firebase** account ([firebase.google.com](https://firebase.google.com))
- **Git** for version control
- Code editor (VS Code recommended)

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Boelslund/boelslund-planwell-finance.git
cd boelslund-planwell-finance
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Enter project name (e.g., "planwell-finance")
4. Disable Google Analytics (optional for development)
5. Click "Create project"

### 4. Enable Firebase Services

#### Authentication
1. In Firebase Console, go to **Authentication** → **Get started**
2. Enable **Email/Password** sign-in method
3. (Optional) Enable other providers as needed

#### Firestore Database
1. Go to **Firestore Database** → **Create database**
2. Choose **Start in test mode** for development
3. Select your preferred region
4. Click **Enable**

#### Firebase Hosting (Optional)
1. Go to **Hosting** → **Get started**
2. Follow the setup steps if you plan to deploy

### 5. Get Firebase Configuration

1. In Firebase Console, click the **gear icon** → **Project settings**
2. Scroll down to "Your apps"
3. Click the **Web** icon (`</>`) to add a web app
4. Register app with nickname (e.g., "Boelslund PlanWell Finance Web")
5. Copy the `firebaseConfig` object values

### 6. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env.local
   
   # macOS/Linux
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your Firebase values:
   ```bash
   VITE_FIREBASE_API_KEY=AIzaSyC...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   VITE_FIREBASE_MEASUREMENT_ID=G-ABC123XYZ
   ```

   > **Note**: `VITE_FIREBASE_MEASUREMENT_ID` is optional and only needed if using Firebase Analytics

### 7. Verify Setup

Start the development server:

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) - you should see the app running without errors.

## Troubleshooting

### Missing Environment Variables Error

If you see an error like:
```
Missing required Firebase environment variables: VITE_FIREBASE_API_KEY, ...
```

**Solution**: Ensure your `.env.local` file exists and contains all required variables (see step 6).

### Firebase Initialization Failed

If Firebase fails to initialize:

1. **Check your config values** - Ensure they match your Firebase project
2. **Restart dev server** - Environment variables are loaded at startup
3. **Check Firebase project status** - Ensure services are enabled in console

### Port Already in Use

If port 5173 is already in use:

```bash
# Vite will automatically try the next available port
# Or specify a different port:
npm run dev -- --port 3000
```

## Next Steps

- Review [firebase-lazy-init.md](./firebase-lazy-init.md) to understand Firebase initialization
- Check [TESTING.md](./TESTING.md) for running and writing tests
- See [CONTRIBUTING.md](./CONTRIBUTING.md) for development workflow

## Security Notes

- ⚠️ **Never commit `.env.local`** - It's in `.gitignore` for a reason
- ✅ **Firebase config is safe to expose** - These values are meant to be public
- 🔒 **Security comes from Firestore rules** - Not from hiding config values
- 🔐 **Use Firebase Auth** - Always authenticate users before allowing data access

## Additional Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Firebase Web Setup](https://firebase.google.com/docs/web/setup)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firestore Getting Started](https://firebase.google.com/docs/firestore/quickstart)
