import { describe, expect, it } from 'vitest'
import {
  formatNewYorkDateTime,
  getNewYorkDayKey,
  isOnNewYorkDay,
} from './time'

describe('America/New_York time utilities', () => {
  it('groups 2026-06-17T01:00:00Z as 6/16/2026 in America/New_York', () => {
    expect(getNewYorkDayKey('2026-06-17T01:00:00Z')).toBe('2026-06-16')
  })

  it('groups 2026-06-17T04:00:00Z as 6/17/2026 in America/New_York', () => {
    expect(getNewYorkDayKey('2026-06-17T04:00:00Z')).toBe('2026-06-17')
  })

  it('excludes matches whose America/New_York date is not the selected day', () => {
    const matches = [
      { id: 'late-6-16', kickoffTime: '2026-06-17T01:00:00Z' },
      { id: 'midnight-6-17', kickoffTime: '2026-06-17T04:00:00Z' },
    ]

    expect(matches.filter((match) => isOnNewYorkDay(match.kickoffTime, '2026-06-16'))).toEqual([
      { id: 'late-6-16', kickoffTime: '2026-06-17T01:00:00Z' },
    ])
  })

  it('formats kickoff display with the ET label', () => {
    expect(formatNewYorkDateTime('2026-06-17T01:00:00Z')).toBe('6/16/2026, 9:00 PM ET')
  })

  it('formats last updated display without raw ISO text', () => {
    const formatted = formatNewYorkDateTime('2026-06-11T21:45:00Z')

    expect(formatted).toBe('6/11/2026, 5:45 PM ET')
    expect(formatted).not.toContain('2026-06-11T21:45:00Z')
  })
})
