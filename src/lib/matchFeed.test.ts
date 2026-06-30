import { describe, expect, it } from 'vitest'
import { formatMatchFeedScore, formatPenaltyShootoutScore, getDefaultMatchFeedDay, getMatchesForNewYorkDay } from './matchFeed'
import type { Match } from '../types'

describe('Match Feed day selection', () => {
  it('defaults to the current New York day', () => {
    expect(getDefaultMatchFeedDay(new Date('2026-06-12T03:30:00.000Z'))).toBe('2026-06-11')
  })

  it('filters matches by New York day', () => {
    const matches: Match[] = [
      {
        id: 'late-ny',
        stage: 'Group',
        status: 'scheduled',
        kickoffTime: '2026-06-12T03:30:00.000Z',
        homeTeamId: 'a',
        awayTeamId: 'b',
        homeGoals: 0,
        awayGoals: 0,
      },
    ]

    expect(getMatchesForNewYorkDay(matches, '2026-06-11').map((match) => match.id)).toEqual(['late-ny'])
    expect(getMatchesForNewYorkDay(matches, '2026-06-12')).toEqual([])
  })

  it('excludes penalty shootout goals from the main match feed score', () => {
    const match: Match = {
      id: 'germany-paraguay',
      stage: 'ROUND_OF_16',
      status: 'finished',
      kickoffTime: '2026-07-04T19:00:00.000Z',
      homeTeamId: 'germany',
      awayTeamId: 'paraguay',
      homeGoals: 1,
      awayGoals: 1,
      homePenaltyShootoutGoals: 4,
      awayPenaltyShootoutGoals: 3,
    }

    expect(formatMatchFeedScore(match, 'Germany', 'Paraguay')).toBe('FINISHED · Germany 1 - 1 Paraguay')
  })

  it('displays penalty shootout results separately when present', () => {
    const match: Match = {
      id: 'germany-paraguay',
      stage: 'ROUND_OF_16',
      status: 'finished',
      kickoffTime: '2026-07-04T19:00:00.000Z',
      homeTeamId: 'germany',
      awayTeamId: 'paraguay',
      homeGoals: 1,
      awayGoals: 1,
      homePenaltyShootoutGoals: 4,
      awayPenaltyShootoutGoals: 3,
    }

    expect(formatPenaltyShootoutScore(match, 'Germany', 'Paraguay')).toBe('Penalties: Germany 4 - 3 Paraguay')
  })
})
