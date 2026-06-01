import './App.css'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { SignIn } from './components/auth/SignIn'
import { SignUp } from './components/auth/SignUp'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { Layout } from './components/layout/Layout'
import { Privacy } from './components/legal/Privacy'
import { Terms } from './components/legal/Terms'
import { Support } from './components/legal/Support'
import { Home } from './pages/Home'
import { Dashboard } from './pages/Dashboard'
import { PasswordReset } from './components/auth/PasswordReset'
import { UserSettings } from './components/settings/UserSettings'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <Routes>
            <Route element={<Layout><Outlet /></Layout>}>
              <Route path="/" element={<Home />} />
              <Route path="/password-reset" element={<PasswordReset />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <UserSettings />
                </ProtectedRoute>
              } />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/support" element={<Support />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
            </Route>
          </Routes>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App
