import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Footer } from './Footer'

const renderFooter = () => {
  return render(
    <BrowserRouter>
      <Footer />
    </BrowserRouter>
  )
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
