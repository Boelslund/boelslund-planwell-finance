import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Privacy } from './Privacy'

const renderPrivacy = () => {
  return render(
    <BrowserRouter>
      <Privacy />
    </BrowserRouter>
  )
}

describe('Privacy Component', () => {
  it('should render main heading and all section headings', () => {
    renderPrivacy()

    expect(screen.getByRole('heading', { level: 1, name: /privacy policy/i })).toBeInTheDocument()

    expect(screen.getByRole('heading', { level: 2, name: /information we collect/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /how we use your information/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /data security/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /your rights/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /contact/i })).toBeInTheDocument()
  })

  it('should display key content about data collection and security', () => {
    renderPrivacy()

    expect(screen.getByText(/planwell finance collects information you provide/i)).toBeInTheDocument()
    expect(screen.getByText(/we do not sell or share your personal data/i)).toBeInTheDocument()
    expect(screen.getByText(/we use firebase authentication and firestore/i)).toBeInTheDocument()
    expect(screen.getByText(/all data is encrypted in transit and at rest/i)).toBeInTheDocument()
  })

  it('should have a link to the support page', () => {
    renderPrivacy()

    const supportLink = screen.getByRole('link', { name: /support/i })
    expect(supportLink).toHaveAttribute('href', '/support')
  })

  it('should have proper document structure with 5 sections', () => {
    const { container } = renderPrivacy()

    const sections = container.querySelectorAll('section')
    expect(sections).toHaveLength(5)

    const h1Elements = screen.getAllByRole('heading', { level: 1 })
    const h2Elements = screen.getAllByRole('heading', { level: 2 })
    expect(h1Elements).toHaveLength(1)
    expect(h2Elements).toHaveLength(5)
  })
})
