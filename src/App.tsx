import './App.css'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SignIn } from './components/auth/SignIn'
import { SignUp } from './components/auth/SignUp'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { Layout } from './components/layout/Layout'
import { Privacy } from './components/legal/Privacy'
import { Terms } from './components/legal/Terms'
import { Support } from './components/legal/Support'
import { Home } from './pages/Home'
import { Dashboard } from './pages/Dashboard'

function LayoutWrapper() {
  return <Layout><Outlet /></Layout>
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<LayoutWrapper />}>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/support" element={<Support />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App
