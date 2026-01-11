import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Support } from './Support'

describe('Support Component', () => {
  it('should render main heading and all section headings', () => {
    render(<Support />)

    expect(screen.getByRole('heading', { level: 1, name: /support/i })).toBeInTheDocument()

    expect(screen.getByRole('heading', { level: 2, name: /common questions/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /contact/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /report a bug/i })).toBeInTheDocument()

    expect(screen.getByRole('heading', { level: 3, name: /how do i create a budget/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /is my data secure/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /can i share my budget/i })).toBeInTheDocument()
  })

  it('should display FAQ content', () => {
    render(<Support />)

    expect(screen.getByText(/budget creation is not yet implemented/i)).toBeInTheDocument()
    expect(screen.getByText(/we use firebase authentication and firestore/i)).toBeInTheDocument()
    expect(screen.getByText(/budget sharing functionality is coming/i)).toBeInTheDocument()
  })

  it('should display contact information with valid links', () => {
    render(<Support />)

    const emailLink = screen.getByRole('link', { name: /planwell finance support/i })
    expect(emailLink).toHaveAttribute('href', 'mailto:sigga.boelslund+planwellfinance@gmail.com')

    const githubLink = screen.getByRole('link', { name: /github\.com\/boelslund/i })
    expect(githubLink).toHaveAttribute('href', 'https://github.com/Boelslund/boelslund-planwell-finance')
    expect(githubLink).toHaveAttribute('target', '_blank')
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should display bug report instructions with checklist', () => {
    const { container } = render(<Support />)

    expect(screen.getByText(/found a bug\? please open an issue/i)).toBeInTheDocument()
    expect(screen.getByText(/description of the problem/i)).toBeInTheDocument()
    expect(screen.getByText(/steps to reproduce/i)).toBeInTheDocument()
    expect(screen.getByText(/expected vs actual behavior/i)).toBeInTheDocument()
    expect(screen.getByText(/browser and device information/i)).toBeInTheDocument()

    const listItems = container.querySelectorAll('ul li')
    expect(listItems).toHaveLength(4)
  })

  it('should have proper document structure', () => {
    const { container } = render(<Support />)

    const sections = container.querySelectorAll('section')
    expect(sections).toHaveLength(3)

    const h1Elements = screen.getAllByRole('heading', { level: 1 })
    const h2Elements = screen.getAllByRole('heading', { level: 2 })
    const h3Elements = screen.getAllByRole('heading', { level: 3 })

    expect(h1Elements).toHaveLength(1)
    expect(h2Elements).toHaveLength(3)
    expect(h3Elements).toHaveLength(3)
  })
})
