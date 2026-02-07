import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Header } from './Header'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { mockUser, setupAuthMock, renderWithProviders } from '../../test/test-utils'

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

const renderHeader = (user: Partial<User> | null = mockUser) => {
  setupAuthMock(user, onAuthStateChanged)
  return renderWithProviders(<Header />)
}

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('User Information Display', () => {
    it('should display user display name when available', async () => {
      renderHeader(mockUser)

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument()
      })
    })

    it('should display email as fallback when display name is not available', async () => {
      const userWithoutName = { ...mockUser, displayName: null }
      renderHeader(userWithoutName)

      await waitFor(() => {
        expect(screen.getByText('test@example.com')).toBeInTheDocument()
      })
    })

    it('should not display user section when user is not authenticated', () => {
      renderHeader(null)

      expect(screen.queryByRole('button', { name: /user menu/i })).not.toBeInTheDocument()
    })

    it('should display login button when user is not authenticated', () => {
      renderHeader(null)

      const loginLink = screen.getByRole('link', { name: /sign in/i })
      expect(loginLink).toBeInTheDocument()
      expect(loginLink).toHaveAttribute('href', '/signin')
    })

    it('should display register button when user is not authenticated', () => {
      renderHeader(null)

      const registerLink = screen.getByRole('link', { name: /sign up/i })
      expect(registerLink).toBeInTheDocument()
      expect(registerLink).toHaveAttribute('href', '/signup')
    })

    it('should not display auth buttons when user is authenticated', async () => {
      renderHeader(mockUser)

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument()
      })

      expect(screen.queryByRole('link', { name: /sign in/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /sign up/i })).not.toBeInTheDocument()
    })
  })

  describe('User Avatar', () => {
    it('should display user avatar placeholder when no photo URL', async () => {
      renderHeader(mockUser)

      await waitFor(() => {
        const avatar = screen.getByRole('img', { name: /user avatar/i })
        expect(avatar).toBeInTheDocument()
      })
    })

    it('should display user photo when photoURL is available', async () => {
      const userWithPhoto = { ...mockUser, photoURL: 'https://example.com/photo.jpg' }
      renderHeader(userWithPhoto)

      await waitFor(() => {
        const avatar = screen.getByRole('img', { name: /user avatar/i })
        expect(avatar).toHaveAttribute('src', 'https://example.com/photo.jpg')
      })
    })

    it('should display first letter of display name as avatar fallback', async () => {
      renderHeader(mockUser)

      await waitFor(() => {
        // Look for avatar with first letter
        expect(screen.getByText('T')).toBeInTheDocument()
      })
    })

    it('should display first letter of email when no display name', async () => {
      const userWithoutName = { ...mockUser, displayName: null }
      renderHeader(userWithoutName)

      await waitFor(() => {
        // First letter of email (t from test@example.com)
        const avatarText = screen.getAllByText('T')[0]
        expect(avatarText).toBeInTheDocument()
      })
    })
  })

  describe('User Menu Dropdown', () => {
    it('should not show dropdown menu by default', async () => {
      renderHeader(mockUser)

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument()
      })

      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('should open dropdown menu when user info is clicked', async () => {
      const user = userEvent.setup()
      renderHeader(mockUser)

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument()
      })

      // Click on user info to open dropdown
      const userInfoButton = screen.getByRole('button', { name: /user menu/i })
      await user.click(userInfoButton)

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument()
      })
    })

    it('should close dropdown menu when clicking outside', async () => {
      const user = userEvent.setup()
      renderHeader(mockUser)

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument()
      })

      const userInfoButton = screen.getByRole('button', { name: /user menu/i })
      await user.click(userInfoButton)

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument()
      })

      const title = screen.getByRole('heading', { name: /planwell finance/i })
      await user.click(title)

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      })
    })

    it('should close dropdown menu when clicking menu button again', async () => {
      const user = userEvent.setup()
      renderHeader(mockUser)

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument()
      })

      // Open dropdown
      const userInfoButton = screen.getByRole('button', { name: /user menu/i })
      await user.click(userInfoButton)

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument()
      })

      // Click again to close
      await user.click(userInfoButton)

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      })
    })
  })

  describe('Sign Out Functionality', () => {
    it('should display sign out button in dropdown menu', async () => {
      const user = userEvent.setup()
      renderHeader(mockUser)

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument()
      })

      // Open dropdown
      const userInfoButton = screen.getByRole('button', { name: /user menu/i })
      await user.click(userInfoButton)

      await waitFor(() => {
        const logoutButton = screen.getByRole('menuitem', { name: /sign out/i })
        expect(logoutButton).toBeInTheDocument()
      })
    })

    it('should call signOut when sign out button is clicked', async () => {
      const { signOut } = await import('firebase/auth')
      const { getAuthInstance } = await import('../../firebase')
      vi.mocked(signOut).mockResolvedValue(undefined)

      const user = userEvent.setup()
      renderHeader(mockUser)

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument()
      })

      const userInfoButton = screen.getByRole('button', { name: /user menu/i })
      await user.click(userInfoButton)

      const logoutButton = await screen.findByRole('menuitem', { name: /sign out/i })
      await user.click(logoutButton)

      await waitFor(() => {
        expect(signOut).toHaveBeenCalledWith(getAuthInstance())
      })
    })

    it('should redirect to home page after successful sign out', async () => {
      const { signOut } = await import('firebase/auth')
      vi.mocked(signOut).mockResolvedValue(undefined)

      const user = userEvent.setup()
      renderHeader(mockUser)

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument()
      })

      const userInfoButton = screen.getByRole('button', { name: /user menu/i })
      await user.click(userInfoButton)

      const logoutButton = await screen.findByRole('menuitem', { name: /sign out/i })
      await user.click(logoutButton)

      await waitFor(() => {
        expect(window.location.pathname).toBe('/')
      })
    })

    it('should handle Sign out errors gracefully', async () => {
      const { signOut } = await import('firebase/auth')
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
      vi.mocked(signOut).mockRejectedValue(new Error('Sign out failed'))

      const user = userEvent.setup()
      renderHeader(mockUser)

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument()
      })

      const userInfoButton = screen.getByRole('button', { name: /user menu/i })
      await user.click(userInfoButton)

      const logoutButton = await screen.findByRole('menuitem', { name: /sign out/i })
      await user.click(logoutButton)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Sign out error:', expect.any(Error))
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels for user menu button', async () => {
      renderHeader(mockUser)

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /user menu/i })
        expect(button).toHaveAttribute('aria-haspopup', 'true')
        expect(button).toHaveAttribute('aria-expanded', 'false')
      })
    })

    it('should update aria-expanded when menu is open', async () => {
      const user = userEvent.setup()
      renderHeader(mockUser)

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument()
      })

      const userInfoButton = screen.getByRole('button', { name: /user menu/i })

      // Initially closed
      expect(userInfoButton).toHaveAttribute('aria-expanded', 'false')

      // Open menu
      await user.click(userInfoButton)

      await waitFor(() => {
        expect(userInfoButton).toHaveAttribute('aria-expanded', 'true')
      })
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      renderHeader(mockUser)

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument()
      })

      const userInfoButton = screen.getByRole('button', { name: /user menu/i })

      // Focus and activate with Enter key
      userInfoButton.focus()
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument()
      })
    })

    it('should close menu with Escape key', async () => {
      const user = userEvent.setup()
      renderHeader(mockUser)

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument()
      })

      // Open menu
      const userInfoButton = screen.getByRole('button', { name: /user menu/i })
      await user.click(userInfoButton)

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument()
      })

      // Press Escape
      await user.keyboard('{Escape}')

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      })
    })
  })
})

describe('Header - Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('WCAG Compliance', () => {
    it('should have no accessibility violations when unauthenticated', async () => {
      const { container } = renderHeader(null)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no accessibility violations when authenticated', async () => {
      const { container } = renderHeader(mockUser)
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument()
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no accessibility violations with user menu open', async () => {
      const user = userEvent.setup()
      const { container } = renderHeader(mockUser)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument()
      })

      const menuButton = screen.getByRole('button', { name: /user menu/i })
      await user.click(menuButton)

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument()
      })

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Semantic HTML', () => {
    it('should use semantic header element', () => {
      const { container } = renderHeader(mockUser)
      const header = container.querySelector('header')
      expect(header).toBeInTheDocument()
      expect(header).toHaveClass('header')
    })

    it('should have banner role', () => {
      renderHeader(mockUser)
      const banner = screen.getByRole('banner')
      expect(banner).toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should allow keyboard navigation to user menu', async () => {
      const user = userEvent.setup()
      renderHeader(mockUser)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument()
      })

      const menuButton = screen.getByRole('button', { name: /user menu/i })
      menuButton.focus()
      expect(menuButton).toHaveFocus()

      await user.keyboard('{Enter}')
      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument()
      })
    })

    it('should close menu with Escape key', async () => {
      const user = userEvent.setup()
      renderHeader(mockUser)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument()
      })

      const menuButton = screen.getByRole('button', { name: /user menu/i })
      await user.click(menuButton)

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument()
      })

      await user.keyboard('{Escape}')

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      })
    })
  })

  describe('ARIA Attributes', () => {
    it('should have aria-expanded on menu button', async () => {
      renderHeader(mockUser)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument()
      })

      const menuButton = screen.getByRole('button', { name: /user menu/i })
      expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('should update aria-expanded when menu is toggled', async () => {
      const user = userEvent.setup()
      renderHeader(mockUser)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument()
      })

      const menuButton = screen.getByRole('button', { name: /user menu/i })
      expect(menuButton).toHaveAttribute('aria-expanded', 'false')

      await user.click(menuButton)

      await waitFor(() => {
        expect(menuButton).toHaveAttribute('aria-expanded', 'true')
      })
    })
  })

  describe('Focus Management', () => {
    it('should maintain focus when menu is opened', async () => {
      const user = userEvent.setup()
      renderHeader(mockUser)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument()
      })

      const menuButton = screen.getByRole('button', { name: /user menu/i })
      await user.click(menuButton)

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument()
      })

      expect(document.activeElement).toBeTruthy()
    })
  })

  describe('Screen Reader Support', () => {
    it('should have accessible button for user menu', async () => {
      renderHeader(mockUser)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument()
      })

      const menuButton = screen.getByRole('button', { name: /user menu/i })
      expect(menuButton).toHaveAccessibleName()
    })

    it('should have accessible sign out button', async () => {
      const user = userEvent.setup()
      renderHeader(mockUser)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument()
      })

      const menuButton = screen.getByRole('button', { name: /user menu/i })
      await user.click(menuButton)

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /sign out/i })).toBeInTheDocument()
      })

      const signOutButton = screen.getByRole('menuitem', { name: /sign out/i })
      expect(signOutButton).toHaveAccessibleName()
    })
  })
})

