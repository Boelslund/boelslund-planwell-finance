import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Loading } from './Loading'

describe('Loading Component', () => {
  describe('Rendering', () => {
    it('should render loading container with default message', () => {
      render(<Loading />)

      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render with custom message', () => {
      render(<Loading message="Please wait..." />)

      expect(screen.getByText('Please wait...')).toBeInTheDocument()
    })

    it('should render loading spinner', () => {
      const { container } = render(<Loading />)

      const spinner = container.querySelector('.loading-spinner')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<Loading />)

      const container = screen.getByRole('status')
      expect(container).toHaveAttribute('aria-live', 'polite')
    })

    it('should hide spinner from screen readers', () => {
      const { container } = render(<Loading />)

      const spinner = container.querySelector('.loading-spinner')
      expect(spinner).toHaveAttribute('aria-hidden', 'true')
    })

    it('should have accessible message for screen readers', () => {
      render(<Loading message="Loading your data" />)

      const message = screen.getByText('Loading your data')
      expect(message).toBeInTheDocument()
    })
  })

  describe('CSS Classes', () => {
    it('should apply correct CSS classes', () => {
      const { container } = render(<Loading />)

      const loadingContainer = screen.getByRole('status')
      expect(loadingContainer).toHaveClass('loading-container')

      const spinner = container.querySelector('.loading-spinner')
      expect(spinner).toHaveClass('loading-spinner')

      const message = screen.getByText('Loading...')
      expect(message).toHaveClass('loading-message')
    })
  })
})
