import { describe, expect, it } from 'vitest'
import {
  assignments,
  managers as mockManagers,
  matches as mockMatches,
  teams as mockTeams,
} from './mockData'
import {
  getActiveTeamsRemaining,
  getAssignedTeams,
  getManagerTotal,
  getTeamGoals,
  rankManagers,
} from './scoring'
import type { Assignment, Manager, Match, MatchScoreOverride, Team, TeamGoalAdjustment } from './types'

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
    homeGoals: 7,
    awayGoals: 5,
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

function getUnassignedTeams(teams: Team[], assignments: Assignment[]): Team[] {
  const assignedTeamIds = new Set(assignments.map((assignment) => assignment.teamId))

  return teams.filter((team) => !assignedTeamIds.has(team.id))
}

describe('scoring', () => {
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
    ).toEqual(['Top', 'Middle', 'Bottom'])
  })

  it('counts eliminated teams toward the manager total', () => {
    expect(getManagerTotal(testManagers[1], testTeams, testAssignments, testMatches)).toBe(16)
  })

  it('does not count scheduled match goals', () => {
    expect(getTeamGoals(testTeams[0], testMatches)).toBe(4)
  })

  it('counts live match goals', () => {
    expect(getTeamGoals(testTeams[6], testMatches)).toBe(3)
  })

  it('does not count penalty shootout goals', () => {
    expect(getTeamGoals(testTeams[4], testMatches)).toBe(7)
    expect(getTeamGoals(testTeams[5], testMatches)).toBe(5)
  })

  it('counts active and champion teams as active teams remaining', () => {
    expect(getActiveTeamsRemaining(testManagers[1], testTeams, testAssignments, testMatches)).toBe(3)
  })

  it('adds active teams remaining to ranked managers', () => {
    expect(
      rankManagers(testManagers, testTeams, testAssignments, testMatches)[0].activeTeamsRemaining,
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
    expect(getTeamGoals(testTeams[4], testMatches, [], testTeamGoalAdjustments)).toBe(6)
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
