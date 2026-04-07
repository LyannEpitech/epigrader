import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from './test-utils'
import App from '../src/App'

describe('App', () => {
  it('renders EpiGrader title', () => {
    renderWithProviders(<App />)
    expect(screen.getByText('EpiGrader')).toBeInTheDocument()
  })
})