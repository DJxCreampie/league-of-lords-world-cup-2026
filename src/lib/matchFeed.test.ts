import { describe, expect, it } from 'vitest'
import { getDefaultMatchFeedDay, getMatchesForNewYorkDay } from './matchFeed'

describe('Match Feed day selection', () => {
  it('defaults the selected day to today in America/New_York', () => {
    expect(getDefaultMatchFeedDay(new Date('2026-06-17T03:30:00Z'))).toBe('2026-06-16')
    expect(getDefaultMatchFeedDay(new Date('2026-06-17T04:30:00Z'))).toBe('2026-06-17')
  })

  it('returns no matches for today instead of defaulting to the earliest match day', () => {
    const matches = [
      {
        id: 'earliest-match',
        stage: 'Group',
        status: 'scheduled' as const,
        kickoffTime: '2026-06-11T19:00:00Z',
        homeTeamId: 'team-a',
        awayTeamId: 'team-b',
        homeGoals: 0,
        awayGoals: 0,
      },
    ]

    const today = getDefaultMatchFeedDay(new Date('2026-06-17T12:00:00Z'))

    expect(today).toBe('2026-06-17')
    expect(getMatchesForNewYorkDay(matches, today)).toEqual([])
  })
})
