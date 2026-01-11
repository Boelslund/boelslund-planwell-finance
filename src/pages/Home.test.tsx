import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { User } from 'firebase/auth'
import { Home } from './Home'

// Mock Firebase
vi.mock('../firebase', () => ({
    getAuthInstance: vi.fn(),
    getDbInstance: vi.fn(),
}))

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
    onAuthStateChanged: vi.fn((_auth, callback) => {
        if (typeof callback === 'function') {
            callback(null)
        }
        return vi.fn()
    }),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
}))

// Mock AuthContext
const mockUseAuth = vi.fn()
vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => mockUseAuth(),
}))

describe('Home Page', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render welcome message when not authenticated', () => {
        mockUseAuth.mockReturnValue({
            user: null,
            loading: false,
        })

        render(<Home />)

        expect(screen.getByRole('heading', { name: /welcome to planwell finance/i })).toBeInTheDocument()
        expect(screen.getByText(/manage your personal finances with ease/i)).toBeInTheDocument()
    })

    it('should show loading state while checking authentication', () => {
        mockUseAuth.mockReturnValue({
            user: null,
            loading: true,
        })

        render(<Home />)

        expect(screen.getByText(/loading your account/i)).toBeInTheDocument()
    })

    it('should render welcome message when authenticated', () => {
        mockUseAuth.mockReturnValue({
            user: { uid: 'test-user-id', email: 'test@example.com' } as User,
            loading: false,
        })

        render(<Home />)

        expect(screen.getByRole('heading', { name: /welcome to planwell finance/i })).toBeInTheDocument()
        expect(screen.getByText(/manage your personal finances with ease/i)).toBeInTheDocument()
    })
})
