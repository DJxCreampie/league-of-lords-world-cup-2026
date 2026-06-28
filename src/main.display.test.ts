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


describe('team status display source', () => {
  it('uses derived statuses for the teams tab rows', () => {
    expect(source).toContain("status: derivedStatusByTeamId.get(team.id) ?? 'active'")
  })

  it('keeps expanded manager rows on scored team status values', () => {
    expect(source).toContain("team.status === 'eliminated' ? 'is-eliminated' : ''")
    expect(source).toContain('getDisplayStatus(team.status)')
  })
})
