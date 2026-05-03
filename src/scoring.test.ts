import { describe, expect, it } from 'vitest'
import { assignments, managers as mockManagers, teams as mockTeams } from './mockData'
import {
  getActiveTeamsRemaining,
  getAssignedTeams,
  getManagerTotal,
  rankManagers,
} from './scoring'
import type { Assignment, Manager, Team } from './types'

const testManagers: Manager[] = [
  { id: 'middle', name: 'Middle' },
  { id: 'top', name: 'Top' },
  { id: 'bottom', name: 'Bottom' },
]

const testTeams: Team[] = [
  { id: 'team-a', name: 'Team A', goals: 4, status: 'active' },
  { id: 'team-b', name: 'Team B', goals: 2, status: 'active' },
  { id: 'team-c', name: 'Team C', goals: 1, status: 'eliminated' },
  { id: 'team-d', name: 'Team D', goals: 1, status: 'eliminated' },
  { id: 'team-e', name: 'Team E', goals: 7, status: 'active' },
  { id: 'team-f', name: 'Team F', goals: 5, status: 'champion' },
  { id: 'team-g', name: 'Team G', goals: 3, status: 'eliminated' },
  { id: 'team-h', name: 'Team H', goals: 1, status: 'active' },
  { id: 'team-i', name: 'Team I', goals: 1, status: 'active' },
  { id: 'team-j', name: 'Team J', goals: 1, status: 'eliminated' },
  { id: 'team-k', name: 'Team K', goals: 1, status: 'eliminated' },
  { id: 'team-l', name: 'Team L', goals: 1, status: 'eliminated' },
  { id: 'unassigned', name: 'Unassigned', goals: 99, status: 'champion' },
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

function getUnassignedTeams(teams: Team[], assignments: Assignment[]): Team[] {
  const assignedTeamIds = new Set(assignments.map((assignment) => assignment.teamId))

  return teams.filter((team) => !assignedTeamIds.has(team.id))
}

describe('scoring', () => {
  it('sets manager total to the sum of assigned team goals', () => {
    expect(getManagerTotal(testManagers[0], testTeams, testAssignments)).toBe(8)
  })

  it('ranks managers highest total first', () => {
    expect(rankManagers(testManagers, testTeams, testAssignments).map((manager) => manager.name)).toEqual([
      'Top',
      'Middle',
      'Bottom',
    ])
  })

  it('counts eliminated teams toward the manager total', () => {
    expect(getManagerTotal(testManagers[1], testTeams, testAssignments)).toBe(16)
  })

  it('counts active and champion teams as active teams remaining', () => {
    expect(getActiveTeamsRemaining(testManagers[1], testTeams, testAssignments)).toBe(3)
  })

  it('adds active teams remaining to ranked managers', () => {
    expect(rankManagers(testManagers, testTeams, testAssignments)[0].activeTeamsRemaining).toBe(3)
  })

  it('gives each mock manager exactly 4 assigned teams', () => {
    expect(
      mockManagers.map((manager) => getAssignedTeams(manager, mockTeams, assignments).length),
    ).toEqual(Array(10).fill(4))
  })

  it('has exactly 8 unassigned mock teams', () => {
    expect(getUnassignedTeams(mockTeams, assignments)).toHaveLength(8)
  })

  it('does not let unassigned team goals affect manager totals', () => {
    const totalBefore = getManagerTotal(testManagers[0], testTeams, testAssignments)
    const teamsWithChangedUnassignedGoal = testTeams.map((team) =>
      team.id === 'unassigned' ? { ...team, goals: 500 } : team,
    )

    expect(getManagerTotal(testManagers[0], teamsWithChangedUnassignedGoal, testAssignments)).toBe(
      totalBefore,
    )
  })
})
