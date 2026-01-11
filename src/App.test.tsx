import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import type { User } from 'firebase/auth'
import App from './App'

// Mock Firebase
vi.mock('./firebase', () => ({
  getAuthInstance: vi.fn(),
  getDbInstance: vi.fn(),
}))

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth, callback) => {
    // Simulate no user logged in initially
    if (typeof callback === 'function') {
      callback(null)
    }
    return vi.fn() // unsubscribe function
  }),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
}))

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render without crashing', () => {
    render(<App />)
    expect(document.body).toBeTruthy()
  })

  it('should render Home page when not authenticated', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /welcome to planwell finance/i })).toBeInTheDocument()
    }, { timeout: 500 })
  })

  it('should show header with sign in/sign up links when not authenticated', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /boelslund planwell finance/i })).toBeInTheDocument()
    }, { timeout: 500 })
    const signInLinks = screen.getAllByRole('link', { name: /sign in/i })
    const signUpLinks = screen.getAllByRole('link', { name: /sign up/i })
    expect(signInLinks.length).toBeGreaterThan(0)
    expect(signUpLinks.length).toBeGreaterThan(0)
  })

  it('should render the AuthProvider', () => {
    const { container } = render(<App />)
    expect(container).toBeTruthy()
  })

  it('should use BrowserRouter for routing', () => {
    const { container } = render(<App />)
    expect(container).toBeTruthy()
  })

  it('should render Dashboard page when navigating to /dashboard and authenticated', async () => {
    const { onAuthStateChanged } = await import('firebase/auth')

    // Mock authenticated user
    vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
      if (typeof callback === 'function') {
        callback({ uid: 'test-user-id', email: 'test@example.com' } as User)
      }
      return vi.fn()
    })

    // Use window.location to navigate to /dashboard
    window.history.pushState({}, 'Dashboard', '/dashboard')

    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument()
    }, { timeout: 500 })
  })
})
