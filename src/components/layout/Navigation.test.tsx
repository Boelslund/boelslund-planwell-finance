import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Navigation } from './Navigation'
import { AuthProvider } from '../../contexts/AuthContext'
import { onAuthStateChanged, type User } from 'firebase/auth'
import userEvent from '@testing-library/user-event'

// Mock Firebase
vi.mock('../../firebase', () => ({
  getAuthInstance: vi.fn(() => ({ currentUser: null })),
  getDbInstance: vi.fn(),
  getApp: vi.fn(),
}))

vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual('firebase/auth')
  return {
    ...actual,
    getAuth: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn((_auth, callback) => {
      callback(null)
      return vi.fn()
    }),
  }
})

const mockUser: Partial<User> = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
}

const renderNavigation = (user: Partial<User> | null = null, initialRoute = '/') => {
  vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
    (callback as (user: User | null) => void)(user as User | null)
    return vi.fn()
  })

  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('Navigation Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render navigation element', () => {
      renderNavigation()
      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
    })

    it('should have navigation CSS class', () => {
      renderNavigation()
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('navigation')
    })
  })

  describe('Authenticated User Navigation', () => {
    it('should display dashboard link when user is authenticated', async () => {
      renderNavigation(mockUser)

      await waitFor(() => {
        const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
        expect(dashboardLink).toBeInTheDocument()
        expect(dashboardLink).toHaveAttribute('href', '/dashboard')
      })
    })

    // it('should display budgets link when user is authenticated', async () => {
    //   renderNavigation(mockUser)

    //   await waitFor(() => {
    //     const budgetsLink = screen.getByRole('link', { name: /budgets/i })
    //     expect(budgetsLink).toBeInTheDocument()
    //     expect(budgetsLink).toHaveAttribute('href', '/budgets')
    //   })
    // })

    it('should not display sign in link when user is authenticated', async () => {
      renderNavigation(mockUser)

      await waitFor(() => {
        expect(screen.queryByRole('link', { name: /sign in/i })).not.toBeInTheDocument()
      })
    })

    it('should not display sign up link when user is authenticated', async () => {
      renderNavigation(mockUser)

      await waitFor(() => {
        expect(screen.queryByRole('link', { name: /sign up/i })).not.toBeInTheDocument()
      })
    })

    it('should display home link when user is authenticated', () => {
      renderNavigation(mockUser)

      const homeLink = screen.getByRole('link', { name: /home/i })
      expect(homeLink).toBeInTheDocument()
      expect(homeLink).toHaveAttribute('href', '/')
    })
  })

  describe('Unauthenticated User Navigation', () => {

    it('should display home link when user is not authenticated', () => {
      renderNavigation(null)

      const homeLink = screen.getByRole('link', { name: /home/i })
      expect(homeLink).toBeInTheDocument()
      expect(homeLink).toHaveAttribute('href', '/')
    })

    it('should not display dashboard link when user is not authenticated', () => {
      renderNavigation(null)

      expect(screen.queryByRole('link', { name: /dashboard/i })).not.toBeInTheDocument()
    })

    // it('should not display budgets link when user is not authenticated', () => {
    //     renderNavigation(null)

    //     expect(screen.queryByRole('link', { name: /budgets/i })).not.toBeInTheDocument()
    // })
  })

  describe('Active Link Styling', () => {
    it('should apply active class to current route', async () => {
      renderNavigation(mockUser, '/dashboard')

      await waitFor(() => {
        const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
        expect(dashboardLink).toHaveClass('active')
      })
    })

    // it('should not apply active class to inactive routes', async () => {
    //   renderNavigation(mockUser, '/dashboard')

    //   await waitFor(() => {
    //     const budgetsLink = screen.getByRole('link', { name: /budgets/i })
    //     expect(budgetsLink).not.toHaveClass('active')
    //   })
    // })
  })

  describe('Mobile Responsive Menu', () => {
    it('should have mobile menu toggle button', () => {
      renderNavigation(mockUser)

      const menuButton = screen.getByLabelText('Toggle navigation menu')
      expect(menuButton).toBeInTheDocument()
    })

    it('should toggle mobile menu when button is clicked', async () => {
      const user = userEvent.setup()
      renderNavigation(mockUser)

      const menuButton = screen.getByLabelText('Toggle navigation menu')

      // Initially, mobile menu might be hidden or closed
      await user.click(menuButton)

      // After click, menu should be open/expanded
      await waitFor(() => {
        expect(menuButton).toHaveAttribute('aria-expanded', 'true')
      })
    })

    it('should close mobile menu when clicking outside', async () => {
      const user = userEvent.setup()
      renderNavigation(mockUser)

      const menuButton = screen.getByLabelText('Toggle navigation menu')

      // Open menu
      await user.click(menuButton)

      await waitFor(() => {
        expect(menuButton).toHaveAttribute('aria-expanded', 'true')
      })

      // Click outside (on the nav element itself or document body)
      await user.click(document.body)

      await waitFor(() => {
        expect(menuButton).toHaveAttribute('aria-expanded', 'false')
      })
    })

    it('should close mobile menu on Escape key', async () => {
      const user = userEvent.setup()
      renderNavigation(mockUser)

      const menuButton = screen.getByLabelText('Toggle navigation menu')

      // Open menu
      await user.click(menuButton)

      await waitFor(() => {
        expect(menuButton).toHaveAttribute('aria-expanded', 'true')
      })

      // Press Escape
      await user.keyboard('{Escape}')

      await waitFor(() => {
        expect(menuButton).toHaveAttribute('aria-expanded', 'false')
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA label on navigation', () => {
      renderNavigation()

      const nav = screen.getByRole('navigation')
      expect(nav).toHaveAttribute('aria-label')
    })

    it('should have proper ARIA attributes on mobile menu button', () => {
      renderNavigation(mockUser)

      const menuButton = screen.getByLabelText('Toggle navigation menu')
      expect(menuButton).toHaveAttribute('aria-expanded')
      expect(menuButton).toHaveAttribute('aria-label')
    })
  })
})
