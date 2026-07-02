import { describe, expect, it } from 'vitest'
import {
  assignments,
  managers as mockManagers,
  matches as mockMatches,
  teams as mockTeams,
} from './mockData'
import {
  deriveTeamStatuses,
  getActiveTeamsRemaining,
  getAssignedTeams,
  getManagerMatchesPlayed,
  getManagerTotal,
  getTeamGoals,
  getTeamMatchesPlayed,
  rankManagers,
} from './scoring'
import type { Assignment, Manager, Match, MatchScoreOverride, Team, TeamGoalAdjustment, TeamManualOverride } from './types'


const statusTestTeams: Team[] = [
  { id: 'team-a', name: 'Team A', status: 'eliminated' },
  { id: 'team-b', name: 'Team B', status: 'champion' },
  { id: 'team-c', name: 'Team C', status: 'active' },
  { id: 'team-d', name: 'Team D', status: 'active' },
]

const statusTestAssignments: Assignment[] = [
  { managerId: 'middle', teamId: 'team-a' },
  { managerId: 'middle', teamId: 'team-b' },
  { managerId: 'middle', teamId: 'team-c' },
  { managerId: 'middle', teamId: 'team-d' },
]

const groupOnlyMatches: Match[] = [
  {
    id: 'group-a-c',
    stage: 'GROUP_STAGE',
    status: 'finished',
    homeTeamId: 'team-a',
    awayTeamId: 'team-c',
    homeGoals: 1,
    awayGoals: 0,
  },
]

const scheduledKnockoutMatches: Match[] = [
  ...groupOnlyMatches,
  {
    id: 'last-32-a-b',
    stage: 'LAST_32',
    status: 'scheduled',
    homeTeamId: 'team-a',
    awayTeamId: 'team-b',
    homeGoals: 0,
    awayGoals: 0,
  },
]

const finishedKnockoutMatches: Match[] = [
  {
    id: 'last-32-a-b',
    stage: 'LAST_32',
    status: 'finished',
    homeTeamId: 'team-a',
    awayTeamId: 'team-b',
    homeGoals: 2,
    awayGoals: 1,
  },
]

const testManagers: Manager[] = [
  { id: 'middle', name: 'Middle' },
  { id: 'top', name: 'Top' },
  { id: 'bottom', name: 'Bottom' },
]

const testTeams: Team[] = [
  { id: 'team-a', name: 'Team A', status: 'active' },
  { id: 'team-b', name: 'Team B', status: 'active' },
  { id: 'team-c', name: 'Team C', status: 'eliminated' },
  { id: 'team-d', name: 'Team D', status: 'eliminated' },
  { id: 'team-e', name: 'Team E', status: 'active' },
  { id: 'team-f', name: 'Team F', status: 'champion' },
  { id: 'team-g', name: 'Team G', status: 'eliminated' },
  { id: 'team-h', name: 'Team H', status: 'active' },
  { id: 'team-i', name: 'Team I', status: 'active' },
  { id: 'team-j', name: 'Team J', status: 'eliminated' },
  { id: 'team-k', name: 'Team K', status: 'eliminated' },
  { id: 'team-l', name: 'Team L', status: 'eliminated' },
  { id: 'unassigned', name: 'Unassigned', status: 'champion' },
]

const testAssignments: Assignment[] = [
  { managerId: 'middle', teamId: 'team-a' },
  { managerId: 'middle', teamId: 'team-b' },
  { managerId: 'middle', teamId: 'team-c' },
  { managerId: 'middle', teamId: 'team-d' },
  { managerId: 'top', teamId: 'team-e' },
  { managerId: 'top', teamId: 'team-f' },
  { managerId: 'top', teamId: 'team-g' },
  { managerId: 'top', teamId: 'team-h' },
  { managerId: 'bottom', teamId: 'team-i' },
  { managerId: 'bottom', teamId: 'team-j' },
  { managerId: 'bottom', teamId: 'team-k' },
  { managerId: 'bottom', teamId: 'team-l' },
]

const testMatches: Match[] = [
  {
    id: 'finished-a-b',
    stage: 'Group',
    status: 'finished',
    homeTeamId: 'team-a',
    awayTeamId: 'team-b',
    homeGoals: 4,
    awayGoals: 2,
  },
  {
    id: 'finished-c-d',
    stage: 'Group',
    status: 'finished',
    homeTeamId: 'team-c',
    awayTeamId: 'team-d',
    homeGoals: 1,
    awayGoals: 1,
  },
  {
    id: 'finished-e-f-shootout',
    stage: 'Knockout',
    status: 'finished',
    homeTeamId: 'team-e',
    awayTeamId: 'team-f',
    homeGoals: 1,
    awayGoals: 1,
    homePenaltyShootoutGoals: 4,
    awayPenaltyShootoutGoals: 3,
  },
  {
    id: 'live-g-h',
    stage: 'Semifinal',
    status: 'live',
    homeTeamId: 'team-g',
    awayTeamId: 'team-h',
    homeGoals: 3,
    awayGoals: 1,
  },
  {
    id: 'finished-i-j',
    stage: 'Group',
    status: 'finished',
    homeTeamId: 'team-i',
    awayTeamId: 'team-j',
    homeGoals: 1,
    awayGoals: 1,
  },
  {
    id: 'finished-k-l',
    stage: 'Group',
    status: 'finished',
    homeTeamId: 'team-k',
    awayTeamId: 'team-l',
    homeGoals: 1,
    awayGoals: 1,
  },
  {
    id: 'scheduled-a-unassigned',
    stage: 'Final',
    status: 'scheduled',
    homeTeamId: 'team-a',
    awayTeamId: 'unassigned',
    homeGoals: 99,
    awayGoals: 99,
  },
  {
    id: 'finished-unassigned-bottom',
    stage: 'Group',
    status: 'finished',
    homeTeamId: 'unassigned',
    awayTeamId: 'team-i',
    homeGoals: 50,
    awayGoals: 0,
  },
]

const testMatchScoreOverrides: MatchScoreOverride[] = [
  { matchId: 'finished-a-b', homeGoals: 6, awayGoals: 1 },
]

const testTeamGoalAdjustments: TeamGoalAdjustment[] = [
  { teamId: 'team-c', goals: 2 },
  { teamId: 'team-e', goals: -1 },
]

function buildRankingScenario(
  managerResults: { id: string; name: string; goals: number; matchesPlayed: number }[],
): { managers: Manager[]; teams: Team[]; assignments: Assignment[]; matches: Match[] } {
  const managers = managerResults.map(({ id, name }) => ({ id, name }))
  const teams = managerResults.map(({ id, name }) => ({ id: `${id}-team`, name: `${name} Team`, status: 'active' as const }))
  const assignments = managerResults.map(({ id }) => ({ managerId: id, teamId: `${id}-team` }))
  const matches = managerResults.flatMap(({ id, goals, matchesPlayed }) =>
    Array.from({ length: matchesPlayed }, (_, index) => ({
      id: `${id}-match-${index}`,
      stage: 'Group',
      status: 'finished' as const,
      homeTeamId: `${id}-team`,
      awayTeamId: 'opponent',
      homeGoals: index === 0 ? goals : 0,
      awayGoals: 0,
    })),
  )

  return { managers, teams, assignments, matches }
}

function getUnassignedTeams(teams: Team[], assignments: Assignment[]): Team[] {
  const assignedTeamIds = new Set(assignments.map((assignment) => assignment.teamId))

  return teams.filter((team) => !assignedTeamIds.has(team.id))
}

describe('scoring', () => {

  it('keeps all teams active before knockout fixtures exist', () => {
    expect([...deriveTeamStatuses(statusTestTeams, groupOnlyMatches).entries()]).toEqual([
      ['team-a', 'active'],
      ['team-b', 'active'],
      ['team-c', 'active'],
      ['team-d', 'active'],
    ])
  })

  it('eliminates teams absent from real knockout fixtures once knockout fixtures exist', () => {
    const statuses = deriveTeamStatuses(statusTestTeams, scheduledKnockoutMatches)

    expect(statuses.get('team-c')).toBe('eliminated')
    expect(statuses.get('team-d')).toBe('eliminated')
  })

  it('keeps teams appearing in knockout fixtures active', () => {
    const statuses = deriveTeamStatuses(statusTestTeams, scheduledKnockoutMatches)

    expect(statuses.get('team-a')).toBe('active')
    expect(statuses.get('team-b')).toBe('active')
  })

  it('eliminates the loser of a finished knockout match', () => {
    expect(deriveTeamStatuses(statusTestTeams, finishedKnockoutMatches).get('team-b')).toBe('eliminated')
  })

  it('keeps the winner of a finished knockout match active', () => {
    expect(deriveTeamStatuses(statusTestTeams, finishedKnockoutMatches).get('team-a')).toBe('active')
  })

  it('lets manual status overrides beat derived knockout statuses', () => {
    const overrides: TeamManualOverride[] = [
      { teamId: 'team-c', status: 'active', note: 'manual correction' },
      { teamId: 'team-a', status: 'eliminated', note: 'manual correction' },
    ]
    const statuses = deriveTeamStatuses(statusTestTeams, scheduledKnockoutMatches, overrides)

    expect(statuses.get('team-c')).toBe('active')
    expect(statuses.get('team-a')).toBe('eliminated')
  })

  it('updates leaderboard active counts from derived statuses', () => {
    expect(
      rankManagers(testManagers.slice(0, 1), statusTestTeams, statusTestAssignments, scheduledKnockoutMatches)[0]
        .activeTeamsRemaining,
    ).toBe(2)
  })

  it('uses the same derived statuses for active counts and expanded manager team rows', () => {
    const rankedManager = rankManagers(
      testManagers.slice(0, 1),
      statusTestTeams,
      statusTestAssignments,
      finishedKnockoutMatches,
    )[0]

    expect(rankedManager.activeTeamsRemaining).toBe(1)
    expect(rankedManager.teams.map((team) => [team.id, team.status])).toEqual([
      ['team-a', 'active'],
      ['team-b', 'eliminated'],
      ['team-c', 'eliminated'],
      ['team-d', 'eliminated'],
    ])
  })
  it('calculates team goals from matches', () => {
    expect(getTeamGoals(testTeams[0], testMatches)).toBe(4)
  })

  it('sets manager total to the sum of assigned match-based team goals', () => {
    expect(getManagerTotal(testManagers[0], testTeams, testAssignments, testMatches)).toBe(8)
  })

  it('ranks managers highest total first', () => {
    expect(
      rankManagers(testManagers, testTeams, testAssignments, testMatches).map(
        (manager) => manager.name,
      ),
    ).toEqual(['Middle', 'Top', 'Bottom'])
  })

  it('ranks higher goals above lower goals', () => {
    const { managers, teams, assignments, matches } = buildRankingScenario([
      { id: 'lower', name: 'Lower', goals: 9, matchesPlayed: 3 },
      { id: 'higher', name: 'Higher', goals: 10, matchesPlayed: 1 },
    ])

    expect(rankManagers(managers, teams, assignments, matches).map((manager) => manager.name)).toEqual([
      'Higher',
      'Lower',
    ])
  })

  it('ranks more matches played higher when goals are tied', () => {
    const { managers, teams, assignments, matches } = buildRankingScenario([
      { id: 'fewer-matches', name: 'Fewer Matches', goals: 30, matchesPlayed: 14 },
      { id: 'more-matches', name: 'More Matches', goals: 30, matchesPlayed: 15 },
    ])

    expect(rankManagers(managers, teams, assignments, matches).map((manager) => manager.name)).toEqual([
      'More Matches',
      'Fewer Matches',
    ])
  })

  it('gives managers the same rank when goals and matches played are tied', () => {
    const { managers, teams, assignments, matches } = buildRankingScenario([
      { id: 'manager-c', name: 'Manager C', goals: 30, matchesPlayed: 15 },
      { id: 'manager-d', name: 'Manager D', goals: 30, matchesPlayed: 15 },
    ])

    expect(rankManagers(managers, teams, assignments, matches).map((manager) => manager.displayRank)).toEqual([1, 1])
  })

  it('uses competition ranking by skipping the next number after a tie', () => {
    const { managers, teams, assignments, matches } = buildRankingScenario([
      { id: 'first-tied', name: 'First Tied', goals: 10, matchesPlayed: 2 },
      { id: 'second-tied', name: 'Second Tied', goals: 10, matchesPlayed: 2 },
      { id: 'after-tie', name: 'After Tie', goals: 9, matchesPlayed: 2 },
    ])

    expect(rankManagers(managers, teams, assignments, matches).map((manager) => manager.displayRank)).toEqual([1, 1, 3])
  })

  it('supports the example competition ranking sequence', () => {
    const { managers, teams, assignments, matches } = buildRankingScenario([
      { id: 'rank-1', name: 'Rank 1', goals: 10, matchesPlayed: 2 },
      { id: 'rank-2', name: 'Rank 2', goals: 9, matchesPlayed: 2 },
      { id: 'rank-3', name: 'Rank 3', goals: 8, matchesPlayed: 2 },
      { id: 'rank-4', name: 'Rank 4', goals: 7, matchesPlayed: 2 },
      { id: 'rank-5-a', name: 'Rank 5 A', goals: 6, matchesPlayed: 2 },
      { id: 'rank-5-b', name: 'Rank 5 B', goals: 6, matchesPlayed: 2 },
      { id: 'rank-7', name: 'Rank 7', goals: 5, matchesPlayed: 2 },
      { id: 'rank-8', name: 'Rank 8', goals: 4, matchesPlayed: 2 },
      { id: 'rank-9', name: 'Rank 9', goals: 3, matchesPlayed: 2 },
      { id: 'rank-10', name: 'Rank 10', goals: 2, matchesPlayed: 2 },
    ])

    expect(rankManagers(managers, teams, assignments, matches).map((manager) => manager.displayRank)).toEqual([
      1, 2, 3, 4, 5, 5, 7, 8, 9, 10,
    ])
  })

  it('counts eliminated teams toward the manager total', () => {
    expect(getManagerTotal(testManagers[1], testTeams, testAssignments, testMatches)).toBe(6)
  })

  it('does not count scheduled match goals', () => {
    expect(getTeamGoals(testTeams[0], testMatches)).toBe(4)
  })

  it('counts a finished match as 1 match played for each participating team', () => {
    expect(getTeamMatchesPlayed(testTeams[0], testMatches)).toBe(1)
    expect(getTeamMatchesPlayed(testTeams[1], testMatches)).toBe(1)
  })

  it('counts a live match as 1 match played for each participating team', () => {
    expect(getTeamMatchesPlayed(testTeams[6], testMatches)).toBe(1)
    expect(getTeamMatchesPlayed(testTeams[7], testMatches)).toBe(1)
  })

  it('does not count a scheduled match as played', () => {
    expect(getTeamMatchesPlayed(testTeams[0], testMatches)).toBe(1)
    expect(getTeamMatchesPlayed(testTeams[12], testMatches)).toBe(1)
  })

  it('sets manager total matches played to the sum of assigned team matches played', () => {
    expect(getManagerMatchesPlayed(testManagers[0], testTeams, testAssignments, testMatches)).toBe(4)
  })

  it('adds each team matches played to expanded manager team data', () => {
    expect(
      getAssignedTeams(testManagers[1], testTeams, testAssignments, testMatches).map((team) => ({
        id: team.id,
        matchesPlayed: team.matchesPlayed,
      })),
    ).toEqual([
      { id: 'team-e', matchesPlayed: 1 },
      { id: 'team-f', matchesPlayed: 1 },
      { id: 'team-g', matchesPlayed: 1 },
      { id: 'team-h', matchesPlayed: 1 },
    ])
  })


  it('counts live match goals', () => {
    expect(getTeamGoals(testTeams[6], testMatches)).toBe(3)
  })

  it('does not count penalty shootout goals', () => {
    expect(getTeamGoals(testTeams[4], testMatches)).toBe(1)
    expect(getTeamGoals(testTeams[5], testMatches)).toBe(1)
  })


  it('gives each team only one goal from a 1-1 knockout match decided 4-3 on penalties', () => {
    const shootoutMatch: Match[] = [{
      id: 'knockout-penalties',
      stage: 'ROUND_OF_16',
      status: 'finished',
      homeTeamId: 'team-a',
      awayTeamId: 'team-b',
      homeGoals: 1,
      awayGoals: 1,
      homePenaltyShootoutGoals: 4,
      awayPenaltyShootoutGoals: 3,
    }]

    expect(getTeamGoals(testTeams[0], shootoutMatch)).toBe(1)
    expect(getTeamGoals(testTeams[1], shootoutMatch)).toBe(1)
  })

  it('keeps manager totals from counting penalty shootout goals', () => {
    const shootoutMatch: Match[] = [{
      id: 'knockout-penalties',
      stage: 'ROUND_OF_16',
      status: 'finished',
      homeTeamId: 'team-a',
      awayTeamId: 'team-e',
      homeGoals: 1,
      awayGoals: 1,
      homePenaltyShootoutGoals: 4,
      awayPenaltyShootoutGoals: 3,
    }]

    expect(getManagerTotal(testManagers[0], testTeams, testAssignments, shootoutMatch)).toBe(1)
    expect(getManagerTotal(testManagers[1], testTeams, testAssignments, shootoutMatch)).toBe(1)
  })

  it('counts penalty kicks from regulation or extra time when they are included in normal goals', () => {
    const matchWithInGamePenalty: Match[] = [{
      id: 'normal-time-penalty',
      stage: 'GROUP_STAGE',
      status: 'finished',
      homeTeamId: 'team-a',
      awayTeamId: 'team-b',
      homeGoals: 2,
      awayGoals: 1,
    }]

    expect(getTeamGoals(testTeams[0], matchWithInGamePenalty)).toBe(2)
    expect(getTeamGoals(testTeams[1], matchWithInGamePenalty)).toBe(1)
  })

  it('counts derived active teams as active teams remaining', () => {
    expect(getActiveTeamsRemaining(testManagers[1], testTeams, testAssignments, testMatches)).toBe(3)
  })

  it('adds active teams remaining to ranked managers', () => {
    expect(
      rankManagers(testManagers, testTeams, testAssignments, testMatches).find((manager) => manager.id === 'top')?.activeTeamsRemaining,
    ).toBe(3)
  })

  it('gives each mock manager exactly 4 assigned teams', () => {
    expect(
      mockManagers.map(
        (manager) => getAssignedTeams(manager, mockTeams, assignments, mockMatches).length,
      ),
    ).toEqual(Array(10).fill(4))
  })

  it('has exactly 8 unassigned mock teams', () => {
    expect(getUnassignedTeams(mockTeams, assignments)).toHaveLength(8)
  })

  it('does not let unassigned team goals affect manager totals', () => {
    const totalBefore = getManagerTotal(testManagers[2], testTeams, testAssignments, testMatches)
    const matchesWithChangedUnassignedGoal = testMatches.map((match) =>
      match.id === 'finished-unassigned-bottom' ? { ...match, homeGoals: 500 } : match,
    )

    expect(
      getManagerTotal(
        testManagers[2],
        testTeams,
        testAssignments,
        matchesWithChangedUnassignedGoal,
      ),
    ).toBe(totalBefore)
  })

  it('ignores team goalsFor fields when calculating match-based team totals', () => {
    const teamsWithStaleGoals = testTeams.map((team) =>
      team.id === 'team-a' ? { ...team, goalsFor: 99 } : team,
    )

    expect(getTeamGoals(teamsWithStaleGoals[0], testMatches)).toBe(4)
    expect(
      getManagerTotal(testManagers[0], teamsWithStaleGoals, testAssignments, testMatches),
    ).toBe(8)
  })

  it('uses manual match overrides to change team totals', () => {
    expect(getTeamGoals(testTeams[0], testMatches, testMatchScoreOverrides)).toBe(6)
    expect(getTeamGoals(testTeams[1], testMatches, testMatchScoreOverrides)).toBe(1)
  })

  it('uses manual match overrides to change manager totals', () => {
    expect(
      getManagerTotal(testManagers[0], testTeams, testAssignments, testMatches, testMatchScoreOverrides),
    ).toBe(9)
  })

  it('uses manual team goal adjustments to change team totals', () => {
    expect(getTeamGoals(testTeams[2], testMatches, [], testTeamGoalAdjustments)).toBe(3)
    expect(getTeamGoals(testTeams[4], testMatches, [], testTeamGoalAdjustments)).toBe(0)
  })

  it('uses manual team goal adjustments to change manager totals', () => {
    expect(
      getManagerTotal(
        testManagers[0],
        testTeams,
        testAssignments,
        testMatches,
        [],
        testTeamGoalAdjustments,
      ),
    ).toBe(10)
  })

  it('uses normal match scoring when no overrides exist', () => {
    expect(getTeamGoals(testTeams[0], testMatches)).toBe(4)
    expect(getManagerTotal(testManagers[0], testTeams, testAssignments, testMatches)).toBe(8)
  })
})
