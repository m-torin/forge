import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { composeStories } from '@storybook/testing-react'
import * as stories from './Button.stories'

// Compose all stories for testing
const { Primary, Secondary } = composeStories(stories)

describe('Button Component', () => {
  it('renders primary button correctly', () => {
    render(<Primary />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('btn-primary')
  })

  it('renders secondary button correctly', () => {
    render(<Secondary />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('btn-secondary')
  })

  it('executes onClick handler', async () => {
    const { userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()

    render(<Primary />)
    const button = screen.getByRole('button')
    await user.click(button)

    // Add your click handler assertions here
  })
})