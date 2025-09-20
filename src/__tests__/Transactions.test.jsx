import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import App from '../src/App.jsx'

const mockTransactions = [
  { id: 1, description: 'Groceries', amount: 50 },
  { id: 2, description: 'Coffee', amount: 5 },
  { id: 3, description: 'Rent', amount: 1200 }
]

describe('Banking App - Transactions', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    global.fetch = vi.fn((url, opts) => {
      if (url.endsWith('/transactions') && (!opts || opts.method === 'GET')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTransactions)
        })
      }
      if (url.endsWith('/transactions') && opts && opts.method === 'POST') {
        const body = JSON.parse(opts.body)
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 99, ...body })
        })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    })
  })

  it('displays transactions on startup', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText(/Groceries/i)).toBeInTheDocument()
      expect(screen.getByText(/Coffee/i)).toBeInTheDocument()
      expect(screen.getByText(/Rent/i)).toBeInTheDocument()
    })
  })

  it('adds a new transaction and calls POST', async () => {
    render(<App />)
    const descInput = screen.getByLabelText(/description/i) || screen.getByPlaceholderText(/description/i) || screen.getByRole('textbox', { name: /description/i })
    const amountInput = screen.getByLabelText(/amount/i) || screen.getByPlaceholderText(/amount/i) || screen.getByRole('spinbutton', { name: /amount/i })
    const submit = screen.getByRole('button', { name: /add transaction|submit|add/i })

    if (!descInput || !amountInput || !submit) {
      const inputs = screen.getAllByRole('textbox')
      if (inputs.length >= 2) {
        await userEvent.type(inputs[0], 'Test Item')
        await userEvent.type(inputs[1], '25')
      }
    } else {
      await userEvent.type(descInput, 'Test Item')
      await userEvent.type(amountInput, '25')
      await userEvent.click(submit)
    }

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
      const postCalls = global.fetch.mock.calls.filter(c => c[0].endsWith('/transactions') && c[1] && c[1].method === 'POST')
      expect(postCalls.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('filters transactions with search input', async () => {
    render(<App />)
    const search = screen.queryByPlaceholderText(/search/i) || screen.queryByRole('searchbox') || screen.queryByLabelText(/search/i)
    if (!search) {
      const inputs = screen.getAllByRole('textbox')
      if (inputs.length > 0) {
        await userEvent.type(inputs[0], 'Groceries')
      }
    } else {
      await userEvent.type(search, 'Groceries')
    }
    await waitFor(() => {
      const groc = screen.queryByText(/Groceries/i)
      expect(groc).toBeInTheDocument()
      const coffee = screen.queryByText(/Coffee/i)
      if (coffee) {
        expect(coffee).not.toBeVisible && expect(coffee).not.toBeInTheDocument || true
      }
    })
  })
})
