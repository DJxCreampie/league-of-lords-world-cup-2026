import { describe, expect, it } from 'vitest'
import source from './main.tsx?raw'

describe('app header and match feed display copy', () => {
  it('renders an empty state for a selected day with no matches', () => {
    expect(source).toContain('No matches scheduled for this day.')
  })

  it('does not render the diagnostic data source line', () => {
    expect(source).not.toContain('Data: {dataDiagnostics.source}')
    expect(source).not.toContain('matches loaded:')
    expect(source).not.toContain('live/final counted:')
  })
})
