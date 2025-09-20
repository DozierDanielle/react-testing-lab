import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import App from '../App.jsx'

describe('Transactions App Integration', () => {
  beforeEach(() => {
    render(<App />)
  })

  it('displays transactions on startup', async () => {
    await waitFor(() => {
      expect(screen.getByText(/Coffee/i)).toBeInTheDocument()
    })
  })

  it('adds a transaction', async () => {
    const desc = screen.getByLabelText(/description/i)
    const amt = screen.getByLabelText(/amount/i)
    const btn = screen.getByRole('button', { name: /add transaction/i })
    await userEvent.type(desc, 'Test Transaction')
    await userEvent.type(amt, '25')
    fireEvent.click(btn)
    await waitFor(() => {
      expect(screen.getByText(/Test Transaction/i)).toBeInTheDocument()
    })
  })

  it('searches transactions', async () => {
    const search = screen.getByPlaceholderText(/search/i)
    if (search) {
      await userEvent.type(search, 'Groceries')
    }
    await waitFor(() => {
      expect(screen.queryByText(/Groceries/i)).toBeInTheDocument()
    })
  })
})
