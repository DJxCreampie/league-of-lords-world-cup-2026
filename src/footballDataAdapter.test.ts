import { describe, expect, it } from 'vitest'
// @ts-expect-error update-data is an ESM script consumed directly by this adapter regression test.
import { normalizeFootballDataMatch } from '../scripts/update-data.mjs'

describe('football-data adapter score normalization', () => {
  it('stores penalty shootout goals separately from official match goals', () => {
    const normalized = normalizeFootballDataMatch({
      id: 100,
      utcDate: '2026-07-04T19:00:00Z',
      status: 'FINISHED',
      stage: 'ROUND_OF_16',
      homeTeam: { id: 1, name: 'Germany' },
      awayTeam: { id: 2, name: 'Paraguay' },
      score: {
        winner: 'HOME_TEAM',
        fullTime: { home: 1, away: 1 },
        penalties: { home: 4, away: 3 },
      },
      competition: { id: 2000, code: 'WC', name: 'FIFA World Cup' },
      season: { startDate: '2026-06-11' },
      lastUpdated: '2026-07-04T22:00:00Z',
    }, { id: 2000, code: 'WC', name: 'FIFA World Cup' })

    expect(normalized.homeGoals).toBe(1)
    expect(normalized.awayGoals).toBe(1)
    expect(normalized.homePenaltyShootoutGoals).toBe(4)
    expect(normalized.awayPenaltyShootoutGoals).toBe(3)
  })
})
