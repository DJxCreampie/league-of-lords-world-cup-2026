import { describe, expect, it } from 'vitest'
import { formatTeamTier, getTeamTier, sortTeamsByTierThenName } from './teamTiers'

describe('team tiers', () => {
  it('maps known teams and aliases to expected tiers', () => {
    expect(getTeamTier('France')).toBe(1)
    expect(getTeamTier('Congo DR')).toBe(4)
    expect(getTeamTier('Bosnia-Herzegovina')).toBe(4)
    expect(getTeamTier('Curaçao')).toBe(4)
  })

  it('formats unknown tier as em dash', () => {
    expect(formatTeamTier('Unknown FC')).toBe('—')
  })

  it('sorts by tier then team name, with unknown tiers last', () => {
    const sorted = sortTeamsByTierThenName([
      { name: 'Unknown FC' },
      { name: 'Brazil' },
      { name: 'Argentina' },
      { name: 'Congo DR' },
    ])

    expect(sorted.map((team) => team.name)).toEqual([
      'Argentina',
      'Brazil',
      'Congo DR',
      'Unknown FC',
    ])
  })
})
