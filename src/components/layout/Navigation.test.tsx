import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Navigation } from './Navigation'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { mockUser, setupAuthMock, renderWithMemoryRouter } from '../../test/test-utils'

expect.extend(toHaveNoViolations)

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

const renderNavigation = (user: Partial<User> | null = null, initialRoute = '/') => {
  setupAuthMock(user, onAuthStateChanged)
  return renderWithMemoryRouter(<Navigation />, initialRoute)
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

describe('Navigation - Extended Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('WCAG Compliance', () => {
    it('should have no accessibility violations when unauthenticated', async () => {
      const { container } = renderNavigation(null)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no accessibility violations when authenticated', async () => {
      const { container } = renderNavigation(mockUser)

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
      })

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no accessibility violations with mobile menu open', async () => {
      const user = userEvent.setup()
      const { container } = renderNavigation(mockUser)

      await waitFor(() => {
        expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument()
      })

      const menuButton = screen.getByLabelText('Toggle navigation menu')
      await user.click(menuButton)

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Semantic HTML', () => {
    it('should use semantic nav element', () => {
      const { container } = renderNavigation(null)
      const nav = container.querySelector('nav')
      expect(nav).toBeInTheDocument()
      expect(nav).toHaveClass('navigation')
    })

    it('should use semantic list for navigation items', () => {
      const { container } = renderNavigation(null)
      const list = container.querySelector('nav ul')
      expect(list).toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should allow tabbing through navigation links', async () => {
      const user = userEvent.setup()
      renderNavigation(null)

      const homeLink = screen.getByRole('link', { name: /home/i })
      const signInLink = screen.getByRole('link', { name: /sign in/i })
      const signUpLink = screen.getByRole('link', { name: /sign up/i })

      await user.tab()
      expect(homeLink).toHaveFocus()

      await user.tab()
      expect(signInLink).toHaveFocus()

      await user.tab()
      expect(signUpLink).toHaveFocus()
    })

    it('should allow keyboard navigation of mobile menu', async () => {
      const user = userEvent.setup()
      renderNavigation(mockUser)

      await waitFor(() => {
        expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument()
      })

      const menuButton = screen.getByLabelText('Toggle navigation menu')
      menuButton.focus()
      expect(menuButton).toHaveFocus()

      await user.keyboard('{Enter}')
      expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('ARIA Attributes', () => {
    it('should have aria-label on navigation', () => {
      renderNavigation(null)
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveAttribute('aria-label')
    })

    it('should have aria-expanded on mobile menu button', async () => {
      renderNavigation(mockUser)

      await waitFor(() => {
        expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument()
      })

      const menuButton = screen.getByLabelText('Toggle navigation menu')
      expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('should update aria-expanded when menu is toggled', async () => {
      const user = userEvent.setup()
      renderNavigation(mockUser)

      await waitFor(() => {
        expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument()
      })

      const menuButton = screen.getByLabelText('Toggle navigation menu')
      expect(menuButton).toHaveAttribute('aria-expanded', 'false')

      await user.click(menuButton)
      expect(menuButton).toHaveAttribute('aria-expanded', 'true')

      await user.click(menuButton)
      expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('Focus Management', () => {
    it('should maintain focus within navigation', async () => {
      renderNavigation(null)
      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
      expect(document.activeElement).toBeTruthy()
    })
  })

  describe('Screen Reader Support', () => {
    it('should have descriptive link text', () => {
      renderNavigation(null)

      const homeLink = screen.getByRole('link', { name: /home/i })
      const signInLink = screen.getByRole('link', { name: /sign in/i })
      const signUpLink = screen.getByRole('link', { name: /sign up/i })

      expect(homeLink).toHaveAccessibleName()
      expect(signInLink).toHaveAccessibleName()
      expect(signUpLink).toHaveAccessibleName()
    })

    it('should have descriptive button text for mobile menu', async () => {
      renderNavigation(mockUser)

      await waitFor(() => {
        expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument()
      })

      const menuButton = screen.getByLabelText('Toggle navigation menu')
      expect(menuButton).toHaveAttribute('aria-label', 'Toggle navigation menu')
    })

    // Note: Sign out button is in the Header component, not Navigation
  })
})
