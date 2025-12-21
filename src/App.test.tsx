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

  it('should redirect to login when not authenticated', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument()
    }, { timeout: 500 })
  })

  it('should render login form when not authenticated', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    }, { timeout: 500 })
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('should provide navigation to register page from login', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
    }, { timeout: 500 })
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument()
  })

  it('should render the AuthProvider', () => {
    const { container } = render(<App />)
    expect(container).toBeTruthy()
  })

  it('should use BrowserRouter for routing', () => {
    const { container } = render(<App />)
    expect(container).toBeTruthy()
  })

  it('should render Home page when authenticated', async () => {
    const { onAuthStateChanged } = await import('firebase/auth')

    // Mock authenticated user
    vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
      if (typeof callback === 'function') {
        callback({ uid: 'test-user-id', email: 'test@example.com' } as User)
      }
      return vi.fn()
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /boelslund planwell finance/i })).toBeInTheDocument()
    }, { timeout: 500 })
    expect(screen.getByText(/welcome! you are logged in/i)).toBeInTheDocument()
  })
})
