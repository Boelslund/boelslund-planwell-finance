import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Terms } from './Terms'

describe('Terms Component', () => {
  it('should render main heading and all 6 section headings', () => {
    render(<Terms />)

    expect(screen.getByRole('heading', { level: 1, name: /terms of service/i })).toBeInTheDocument()

    expect(screen.getByRole('heading', { level: 2, name: /acceptance of terms/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /use of service/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /user content/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /disclaimer/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /limitation of liability/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /changes to terms/i })).toBeInTheDocument()
  })

  it('should display key legal content', () => {
    render(<Terms />)

    expect(screen.getByText(/by accessing and using planwell finance/i)).toBeInTheDocument()
    expect(screen.getByText(/you retain all rights to the budget data/i)).toBeInTheDocument()
    expect(screen.getByText(/planwell finance is provided "as is"/i)).toBeInTheDocument()
    expect(screen.getByText(/we are not liable for any damages/i)).toBeInTheDocument()
  })

  it('should have proper document structure with 6 sections', () => {
    const { container } = render(<Terms />)

    const sections = container.querySelectorAll('section')
    expect(sections).toHaveLength(6)

    const h1Elements = screen.getAllByRole('heading', { level: 1 })
    const h2Elements = screen.getAllByRole('heading', { level: 2 })
    expect(h1Elements).toHaveLength(1)
    expect(h2Elements).toHaveLength(6)
  })
})
