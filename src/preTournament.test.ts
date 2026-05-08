import { describe, expect, it } from 'vitest'
import { assignments, managers, matchScoreOverrides, matches, teamGoalAdjustments, teamManualOverrides, teams } from './mockData'
import generatedData from './data/normalized/generated-data.json'
import assignableTeams from './data/assignments/assignable-teams-2026.json'
import { deriveGeneratedTeamPool } from './lib/teamPool'
import { getAssignedTeams, rankManagers } from './scoring'

describe('assignment integrity and pre-tournament behavior', () => {
  it('generated-data-derived team pool includes 48 real teams', () => {
    const { teams: generatedPool } = deriveGeneratedTeamPool()
    expect(generatedPool).toHaveLength(48)
  })

  it('stale fallback teams do not override generated-data team pool', () => {
    const { teams: generatedPool } = deriveGeneratedTeamPool()
    const generatedIds = new Set(generatedPool.map((team) => team.id))

    expect(generatedIds.has('team-italy')).toBe(false)
    expect(assignableTeams.some((team) => team.id === 'team-italy')).toBe(true)
  })

  it('valid generated team missing from stale list can still be assigned and displayed', () => {
    const { teams: generatedPool } = deriveGeneratedTeamPool()
    const staleIds = new Set(assignableTeams.map((team) => team.id))
    const generatedOnlyTeam = generatedPool.find((team) => !staleIds.has(team.id))

    expect(generatedOnlyTeam).toBeDefined()
    expect(teams.some((team) => team.id === generatedOnlyTeam?.id)).toBe(true)
    expect(assignments.some((assignment) => assignment.teamId === generatedOnlyTeam?.id)).toBe(true)
  })

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
