import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Layout } from './Layout'
import { renderWithProviders } from '../../test/test-utils'

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
    onAuthStateChanged: vi.fn((_auth, callback) => {
      callback(null)
      return vi.fn()
    }),
  }
})

const renderLayout = (children: React.ReactNode) => {
  return renderWithProviders(<Layout>{children}</Layout>)
}

describe('Layout Component', () => {
  describe('Structure', () => {
    it('should render the layout container', () => {
      renderLayout(<div>Test Content</div>)

      const container = screen.getByRole('banner').parentElement
      expect(container).toHaveClass('layout-container')
    })

    it('should render Header component', () => {
      renderLayout(<div>Test Content</div>)

      const header = screen.getByRole('banner')
      expect(header).toBeInTheDocument()
      expect(header).toHaveClass('header')
    })

    it('should render main content area', () => {
      renderLayout(<div data-testid="test-content">Test Content</div>)

      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
      expect(main).toHaveClass('layout-main')
    })

    it('should render Footer component', () => {
      renderLayout(<div>Test Content</div>)

      const footer = screen.getByRole('contentinfo')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveClass('footer')
    })

    it('should render children inside main content area', () => {
      renderLayout(<div data-testid="test-content">Test Content</div>)

      const main = screen.getByRole('main')
      const content = screen.getByTestId('test-content')

      expect(main).toContainElement(content)
      expect(content).toHaveTextContent('Test Content')
    })
  })

  describe('Content Rendering', () => {
    it('should render multiple child elements', () => {
      renderLayout(
        <>
          <h1>Title</h1>
          <p>Paragraph</p>
          <button>Button</button>
        </>
      )

      expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument()
      expect(screen.getByText('Paragraph')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Button' })).toBeInTheDocument()
    })

    it('should render complex nested components', () => {
      renderLayout(
        <div>
          <section>
            <h2>Section Title</h2>
            <article>
              <p>Article content</p>
            </article>
          </section>
        </div>
      )

      expect(screen.getByRole('heading', { name: 'Section Title' })).toBeInTheDocument()
      expect(screen.getByText('Article content')).toBeInTheDocument()
    })

    it('should render empty content gracefully', () => {
      renderLayout(<></>)

      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
      expect(main).toBeEmptyDOMElement()
    })
  })

  describe('Layout Order', () => {
    it('should maintain correct component order: Header -> Main -> Footer', () => {
      renderLayout(<div data-testid="test-content">Content</div>)

      const container = screen.getByRole('banner').parentElement
      const children = Array.from(container?.children || [])

      expect(children[0]).toHaveClass('header')
      expect(children[1]).toHaveClass('layout-main')
      expect(children[2]).toHaveClass('footer')
    })
  })

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      renderLayout(<div>Content</div>)

      expect(screen.getByRole('banner')).toBeInTheDocument() // Header
      expect(screen.getByRole('main')).toBeInTheDocument() // Main
      expect(screen.getByRole('contentinfo')).toBeInTheDocument() // Footer
    })

    it('should have navigation landmarks', () => {
      renderLayout(<div>Content</div>)

      const navigation = screen.getByRole('navigation', { name: 'Navigation' })
      expect(navigation).toBeInTheDocument()
    })
  })
})

describe('Layout - Extended Accessibility', () => {
  describe('WCAG Compliance', () => {
    it('should have no accessibility violations with simple content', async () => {
      const { container } = renderLayout(<div>Test Content</div>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no accessibility violations with complex content', async () => {
      const { container } = renderLayout(
        <>
          <h1>Page Title</h1>
          <section>
            <h2>Section</h2>
            <p>Content paragraph</p>
            <button>Action Button</button>
          </section>
        </>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no accessibility violations with form content', async () => {
      const { container } = renderLayout(
        <form>
          <label htmlFor="test-input">Test Input</label>
          <input id="test-input" type="text" />
          <button type="submit">Submit</button>
        </form>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Semantic Structure', () => {
    it('should have all required landmarks', () => {
      renderLayout(<div>Content</div>)

      const banner = screen.getByRole('banner')
      const main = screen.getByRole('main')
      const contentinfo = screen.getByRole('contentinfo')
      const navigation = screen.getByRole('navigation', { name: 'Navigation' })

      expect(banner).toBeInTheDocument()
      expect(main).toBeInTheDocument()
      expect(contentinfo).toBeInTheDocument()
      expect(navigation).toBeInTheDocument()
    })

    it('should use semantic HTML elements', () => {
      const { container } = renderLayout(<div>Content</div>)

      const header = container.querySelector('header')
      const main = container.querySelector('main')
      const footer = container.querySelector('footer')
      const nav = container.querySelector('nav')

      expect(header).toBeInTheDocument()
      expect(main).toBeInTheDocument()
      expect(footer).toBeInTheDocument()
      expect(nav).toBeInTheDocument()
    })

    it('should maintain proper document structure', () => {
      renderLayout(<div>Content</div>)

      const banner = screen.getByRole('banner')
      const main = screen.getByRole('main')
      const contentinfo = screen.getByRole('contentinfo')

      const container = banner.parentElement
      const children = Array.from(container?.children || [])

      const bannerIndex = children.indexOf(banner)
      const mainIndex = children.indexOf(main)
      const contentinfoIndex = children.indexOf(contentinfo)

      expect(bannerIndex).toBeLessThan(mainIndex)
      expect(mainIndex).toBeLessThan(contentinfoIndex)
    })
  })

  describe('Keyboard Navigation', () => {
    it('should allow keyboard access to all interactive elements', () => {
      renderLayout(
        <>
          <button>Button 1</button>
          <a href="/test">Link</a>
          <button>Button 2</button>
        </>
      )

      const button1 = screen.getByRole('button', { name: 'Button 1' })
      const link = screen.getByRole('link', { name: 'Link' })
      const button2 = screen.getByRole('button', { name: 'Button 2' })

      expect(button1).toBeInTheDocument()
      expect(link).toBeInTheDocument()
      expect(button2).toBeInTheDocument()
    })
  })

  describe('Screen Reader Support', () => {
    it('should provide proper landmark labels', () => {
      renderLayout(<div>Content</div>)

      const main = screen.getByRole('main')
      const navigation = screen.getByRole('navigation', { name: 'Navigation' })

      expect(main).toBeInTheDocument()
      expect(navigation).toBeInTheDocument()
    })

    it('should maintain proper heading hierarchy', () => {
      renderLayout(
        <>
          <h1>Main Heading</h1>
          <section>
            <h2>Section Heading</h2>
            <h3>Subsection Heading</h3>
          </section>
        </>
      )

      const h1 = screen.getByRole('heading', { level: 1, name: 'Main Heading' })
      const h2 = screen.getByRole('heading', { level: 2, name: 'Section Heading' })
      const h3 = screen.getByRole('heading', { level: 3, name: 'Subsection Heading' })

      expect(h1).toBeInTheDocument()
      expect(h2).toBeInTheDocument()
      expect(h3).toBeInTheDocument()
    })
  })

  describe('Focus Management', () => {
    it('should maintain focus within layout', () => {
      renderLayout(<button>Test Button</button>)

      const button = screen.getByRole('button', { name: 'Test Button' })
      button.focus()

      expect(button).toHaveFocus()
    })
  })
})
