import { describe, expect, it } from 'vitest'
import { assignments, dataDiagnostics, managers, matchScoreOverrides, matches, teamGoalAdjustments, teamManualOverrides, teams } from './mockData'
import generatedData from './data/normalized/generated-data.json'
import { deriveGeneratedTeamPool } from './lib/teamPool'
import { getAssignedTeams, getManagerTotal, getTeamGoals, rankManagers } from './scoring'

describe('assignment integrity and pre-tournament behavior', () => {
  it('generated-data-derived team pool includes 48 real teams', () => {
    const { teams: generatedPool } = deriveGeneratedTeamPool()
    expect(generatedPool).toHaveLength(48)
  })

  it('football-data generated teams do not contain stale mock standings goals', () => {
    expect('teams' in generatedData).toBe(false)
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

  it('scores the current Mexico 2-0 South Africa result from matches only', () => {
    const mexico = teams.find((team) => team.id === 'team-mexico')
    const southAfrica = teams.find((team) => team.id === 'team-south-africa')

    expect(mexico).toBeDefined()
    expect(southAfrica).toBeDefined()
    expect(getTeamGoals(mexico!, matches)).toBe(2)
    expect(getTeamGoals(southAfrica!, matches)).toBe(0)
  })

  it('gives Graham 2 total goals from Mexico without stale generated team goals', () => {
    const graham = managers.find((manager) => manager.name === 'Graham')

    expect(graham).toBeDefined()
    expect(getManagerTotal(graham!, teams, assignments, matches)).toBe(2)
  })

  it('does not score stale generated-data team goals for Brazil, France, United States, or Japan', () => {
    const staleGoalTeamIds = [
      'team-brazil',
      'team-france',
      'team-united-states',
      'team-japan',
    ]

    for (const teamId of staleGoalTeamIds) {
      const team = teams.find((candidate) => candidate.id === teamId)
      expect(team).toBeDefined()
      expect(team?.goalsFor).toBe(0)
      expect(getTeamGoals(team!, matches)).toBe(0)
    }
  })

  it('manager totals equal the sum of match-calculated assigned team goals only', () => {
    for (const manager of managers) {
      const assigned = getAssignedTeams(manager, teams, assignments, matches)
      const matchCalculatedTotal = assigned.reduce(
        (sum, team) => sum + getTeamGoals(team, matches),
        0,
      )

      expect(getManagerTotal(manager, teams, assignments, matches)).toBe(matchCalculatedTotal)
    }
  })

  it('generated-data source is not mock-api in production path', () => {
    expect(generatedData.source).not.toBe('mock-api')
  })

  it('production diagnostics reflect committed generated-data', () => {
    expect(dataDiagnostics.source).toBe(generatedData.source)
    expect(dataDiagnostics.generatedAt).toBe(generatedData.generatedAt)
    expect(dataDiagnostics.totalMatchesLoaded).toBe(generatedData.matches.length)
    expect(dataDiagnostics.countedMatches).toBe(
      generatedData.matches.filter((match) => match.status === 'final' || match.status === 'live').length,
    )
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
