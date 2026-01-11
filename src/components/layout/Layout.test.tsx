import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Layout } from './Layout'
import { AuthProvider } from '../../contexts/AuthContext'

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
    return render(
        <BrowserRouter>
            <AuthProvider>
                <Layout>{children}</Layout>
            </AuthProvider>
        </BrowserRouter>
    )
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
