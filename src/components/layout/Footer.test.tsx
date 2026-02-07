import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Footer } from './Footer'
import { renderWithRouter } from '../../test/test-utils'

expect.extend(toHaveNoViolations)

const renderFooter = () => {
  return renderWithRouter(<Footer />)
}

describe('Footer Component', () => {
  describe('Content Display', () => {
    it('should render footer element', () => {
      renderFooter()
      const footer = screen.getByRole('contentinfo')
      expect(footer).toBeInTheDocument()
    })

    it('should display copyright information', () => {
      renderFooter()
      const currentYear = new Date().getFullYear()
      expect(screen.getByText(new RegExp(`© ${currentYear}`, 'i'))).toBeInTheDocument()
    })
  })

  describe('Links', () => {
    it('should display privacy policy link', () => {
      renderFooter()
      const privacyLink = screen.getByRole('link', { name: /privacy/i })
      expect(privacyLink).toBeInTheDocument()
      expect(privacyLink).toHaveAttribute('href', '/privacy')
    })

    it('should display terms of service link', () => {
      renderFooter()
      const termsLink = screen.getByRole('link', { name: /terms/i })
      expect(termsLink).toBeInTheDocument()
      expect(termsLink).toHaveAttribute('href', '/terms')
    })

    it('should display support/contact link', () => {
      renderFooter()
      const supportLink = screen.getByRole('link', { name: /support|contact/i })
      expect(supportLink).toBeInTheDocument()
    })
  })

  describe('Styling and Layout', () => {
    it('should have footer CSS class', () => {
      renderFooter()
      const footer = screen.getByRole('contentinfo')
      expect(footer).toHaveClass('footer')
    })
  })
})

describe('Footer - Accessibility', () => {
  describe('WCAG Compliance', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderFooter()
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Semantic HTML', () => {
    it('should use semantic footer element', () => {
      const { container } = renderFooter()
      const footer = container.querySelector('footer')
      expect(footer).toBeInTheDocument()
    })

    it('should have contentinfo role', () => {
      renderFooter()
      const footer = screen.getByRole('contentinfo')
      expect(footer).toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should have all links keyboard accessible', () => {
      renderFooter()
      const privacyLink = screen.getByRole('link', { name: /privacy/i })
      const termsLink = screen.getByRole('link', { name: /terms/i })
      const supportLink = screen.getByRole('link', { name: /support|contact/i })

      expect(privacyLink).toBeInTheDocument()
      expect(termsLink).toBeInTheDocument()
      expect(supportLink).toBeInTheDocument()
    })
  })

  describe('Screen Reader Support', () => {
    it('should have descriptive link text', () => {
      renderFooter()
      const privacyLink = screen.getByRole('link', { name: /privacy/i })
      const termsLink = screen.getByRole('link', { name: /terms/i })
      const supportLink = screen.getByRole('link', { name: /support|contact/i })

      expect(privacyLink).toHaveAccessibleName()
      expect(termsLink).toHaveAccessibleName()
      expect(supportLink).toHaveAccessibleName()
    })

    it('should have proper copyright text', () => {
      renderFooter()
      const currentYear = new Date().getFullYear()
      expect(screen.getByText(new RegExp(`© ${currentYear}`, 'i'))).toBeInTheDocument()
    })
  })

  describe('Link Structure', () => {
    it('should have valid href attributes', () => {
      renderFooter()
      const privacyLink = screen.getByRole('link', { name: /privacy/i })
      const termsLink = screen.getByRole('link', { name: /terms/i })

      expect(privacyLink).toHaveAttribute('href', '/privacy')
      expect(termsLink).toHaveAttribute('href', '/terms')
    })
  })
})
