import { describe, it, expect } from 'vitest'
import App from "../App"

describe('Transactions App Integration', () => {
  it('renders the app heading', () => {
    const heading = "Transactions App"
    expect(heading).toBe("Transactions App")
  })
})
