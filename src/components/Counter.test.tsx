import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Counter } from './Counter'
import userEvent from '@testing-library/user-event'

describe('Counter Component', () => {
  it('should render with initial count of 0', () => {
    render(<Counter />)
    expect(screen.getByText('Count: 0')).toBeInTheDocument()
  })

  it('should increment count when increment button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    
    const incrementButton = screen.getByRole('button', { name: /increment/i })
    await user.click(incrementButton)
    
    expect(screen.getByText('Count: 1')).toBeInTheDocument()
  })

  it('should decrement count when decrement button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    
    const decrementButton = screen.getByRole('button', { name: /decrement/i })
    await user.click(decrementButton)
    
    expect(screen.getByText('Count: -1')).toBeInTheDocument()
  })

  it('should reset count to 0 when reset button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    
    const incrementButton = screen.getByRole('button', { name: /increment/i })
    const resetButton = screen.getByRole('button', { name: /reset/i })
    
    await user.click(incrementButton)
    await user.click(incrementButton)
    expect(screen.getByText('Count: 2')).toBeInTheDocument()
    
    await user.click(resetButton)
    expect(screen.getByText('Count: 0')).toBeInTheDocument()
  })
})
