import { describe, expect, it } from 'vitest'
import { assignments, managers, matchScoreOverrides, matches, teamGoalAdjustments, teamManualOverrides, teams } from './mockData'
import generatedData from './data/normalized/generated-data.json'
import { getAssignedTeams, rankManagers } from './scoring'

describe('assignment integrity and pre-tournament behavior', () => {

  it('all 48 teams are present and exactly 8 are unassigned', () => {
    expect(teams).toHaveLength(48)
    const assignedIds = new Set(assignments.map((assignment) => assignment.teamId))
    const unassigned = teams.filter((team) => !assignedIds.has(team.id))
    expect(unassigned).toHaveLength(8)
  })

  it('every manager has exactly 4 displayed teams from official assignments', () => {
    for (const manager of managers) {
      const assigned = getAssignedTeams(manager, teams, assignments, matches, matchScoreOverrides, teamGoalAdjustments, teamManualOverrides)
      expect(assigned).toHaveLength(4)
    }
  })

  it('generated-data source is not mock-api in production path', () => {
    expect(generatedData.source).not.toBe('mock-api')
  })

  it('manual override sample data is inactive by default', () => {
    expect(matchScoreOverrides).toHaveLength(0)
    expect(teamManualOverrides).toHaveLength(0)
    expect(teamGoalAdjustments).toHaveLength(0)
  })

  it('upcoming-only schedule yields zero totals and all-active teams', () => {
    const preTournamentTeams = teams.map((team) => ({ ...team, goalsFor: 0, status: 'active' as const }))
    const preTournamentMatches = matches.map((match) => ({ ...match, status: 'scheduled' as const, homeGoals: 0, awayGoals: 0 }))

    const leaderboard = rankManagers(managers, preTournamentTeams, assignments, preTournamentMatches)

    expect(leaderboard.every((manager) => manager.totalGoals === 0)).toBe(true)
    expect(preTournamentTeams.every((team) => team.status === 'active')).toBe(true)
  })
})
