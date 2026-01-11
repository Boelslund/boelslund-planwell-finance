import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Dashboard } from './Dashboard'

describe('Dashboard Page', () => {
    it('should render dashboard heading', () => {
        render(<Dashboard />)

        expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument()
    })

    it('should show logged in message', () => {
        render(<Dashboard />)

        expect(screen.getByText(/you are logged in/i)).toBeInTheDocument()
    })
})
