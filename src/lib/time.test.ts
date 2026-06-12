import { describe, expect, it } from 'vitest'
import { matches } from '../productionData'
import { formatEasternDateTime, formatEasternDayLabel, getEasternDateKey } from './time'

describe('Eastern Time formatting', () => {
  it('groups early UTC kickoff times by the previous Eastern calendar day', () => {
    expect(getEasternDateKey('2026-06-12T02:00:00Z')).toBe('2026-06-11')
  })

  it('groups Mexico vs South Africa and South Korea vs Czechia on the June 11 ET match-feed day', () => {
    const june11Eastern = '2026-06-11'
    const mexicoSouthAfrica = matches.find(
      (match) =>
        match.homeTeamId === 'team-mexico' &&
        match.awayTeamId === 'team-south-africa',
    )
    const southKoreaCzechia = matches.find(
      (match) =>
        match.homeTeamId === 'team-south-korea' &&
        match.awayTeamId === 'team-czechia',
    )

    expect(mexicoSouthAfrica).toBeDefined()
    expect(southKoreaCzechia).toBeDefined()
    expect(getEasternDateKey(mexicoSouthAfrica?.kickoffTime)).toBe(june11Eastern)
    expect(getEasternDateKey(southKoreaCzechia?.kickoffTime)).toBe(june11Eastern)
    expect(formatEasternDayLabel(june11Eastern)).toBe('June 11, 2026 ET')
  })

  it('formats kickoff display in Eastern Time with an ET label', () => {
    expect(formatEasternDateTime('2026-06-12T02:00:00Z')).toBe(
      'Jun 11, 2026, 10:00 PM ET',
    )
  })

  it('formats last updated display in Eastern Time with an ET label', () => {
    expect(formatEasternDateTime('2026-06-11T21:45:32.632Z')).toBe(
      'Jun 11, 2026, 5:45 PM ET',
    )
  })
})
