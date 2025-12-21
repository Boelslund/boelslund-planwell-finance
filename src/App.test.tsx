import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App Component', () => {
  it('should render the application title', () => {
    render(<App />)
    expect(screen.getByText('Boelslund PlanWell Finance')).toBeInTheDocument()
  })

  it('should render the application description', () => {
    render(<App />)
    expect(
      screen.getByText('A modern financial planning application built with React, Firebase, and TDD')
    ).toBeInTheDocument()
  })

  it('should render the Counter component', () => {
    render(<App />)
    expect(screen.getByText(/Count:/i)).toBeInTheDocument()
  })

  it('should render all counter buttons', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /increment/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /decrement/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
  })

  it('should render the information section', () => {
    render(<App />)
    expect(
      screen.getByText('This is a demonstration of test-driven development.')
    ).toBeInTheDocument()
  })

  it('should render the test file reference', () => {
    render(<App />)
    expect(screen.getByText(/Check/i)).toBeInTheDocument()
    expect(screen.getByText(/src\/components\/Counter\.test\.tsx/i)).toBeInTheDocument()
  })

  it('should render the info section with correct class', () => {
    render(<App />)
    const infoSection = screen.getByText('This is a demonstration of test-driven development.').closest('div')
    expect(infoSection).toHaveClass('info')
  })

  it('should have proper document structure', () => {
    const { container } = render(<App />)

    // Check that main heading is h1
    const heading = screen.getByText('Boelslund PlanWell Finance')
    expect(heading.tagName).toBe('H1')

    // Check that there are paragraph elements
    const paragraphs = container.querySelectorAll('p')
    expect(paragraphs.length).toBeGreaterThan(0)
  })
})
