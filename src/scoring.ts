import type {
  Assignment,
  Manager,
  Match,
  MatchScoreOverride,
  Team,
  TeamGoalAdjustment,
  TeamManualOverride,
} from './types'

export type ScoredTeam = Team & { goals: number; matchesPlayed: number }

const GROUP_STAGE_NAMES = new Set(['group', 'group_stage', 'group stage'])

function isKnockoutMatch(match: Match): boolean {
  return !GROUP_STAGE_NAMES.has(match.stage.trim().toLowerCase())
}

function getKnockoutWinnerAndLoser(match: Match): { winnerId: string; loserId: string } | null {
  if (match.homeGoals > match.awayGoals) {
    return { winnerId: match.homeTeamId, loserId: match.awayTeamId }
  }

  if (match.awayGoals > match.homeGoals) {
    return { winnerId: match.awayTeamId, loserId: match.homeTeamId }
  }

  const homePenaltyGoals = match.homePenaltyShootoutGoals
  const awayPenaltyGoals = match.awayPenaltyShootoutGoals

  if (homePenaltyGoals === undefined || awayPenaltyGoals === undefined) return null

  if (homePenaltyGoals > awayPenaltyGoals) {
    return { winnerId: match.homeTeamId, loserId: match.awayTeamId }
  }

  if (awayPenaltyGoals > homePenaltyGoals) {
    return { winnerId: match.awayTeamId, loserId: match.homeTeamId }
  }

  return null
}

export function deriveTeamStatuses(
  teams: Team[],
  matches: Match[],
  teamManualOverrides: TeamManualOverride[] = [],
): Map<string, Team['status']> {
  const validTeamIds = new Set(teams.map((team) => team.id))
  const knockoutMatches = matches.filter(
    (match) =>
      isKnockoutMatch(match) &&
      validTeamIds.has(match.homeTeamId) &&
      validTeamIds.has(match.awayTeamId),
  )
  const derivedStatuses = new Map<string, Team['status']>(
    teams.map((team) => [team.id, 'active' as Team['status']]),
  )

  if (knockoutMatches.length > 0) {
    const knockoutTeamIds = new Set(
      knockoutMatches.flatMap((match) => [match.homeTeamId, match.awayTeamId]),
    )

    teams.forEach((team) => {
      derivedStatuses.set(team.id, knockoutTeamIds.has(team.id) ? 'active' : 'eliminated')
    })

    knockoutMatches
      .filter((match) => match.status === 'finished')
      .forEach((match) => {
        const result = getKnockoutWinnerAndLoser(match)
        if (!result) return

        derivedStatuses.set(result.winnerId, 'active')
        derivedStatuses.set(result.loserId, 'eliminated')
      })
  }

  teamManualOverrides.forEach((override) => {
    if (override.status && validTeamIds.has(override.teamId)) {
      derivedStatuses.set(override.teamId, override.status)
    }
  })

  return derivedStatuses
}

export type RankedManager = Manager & {
  teams: ScoredTeam[]
  totalGoals: number
  activeTeamsRemaining: number
  totalMatchesPlayed: number
  totalKnockoutGoals: number
}

function applyTeamOverrides(teams: Team[], matches: Match[], teamManualOverrides: TeamManualOverride[] = []): Team[] {
  const statusByTeamId = deriveTeamStatuses(teams, matches, teamManualOverrides)

  return teams.map((team) => ({
    ...team,
    status: statusByTeamId.get(team.id) ?? 'active',
  }))
}


function getMatchGoals(match: Match, matchScoreOverrides: MatchScoreOverride[]): Pick<Match, 'homeGoals' | 'awayGoals'> {
  return matchScoreOverrides.find((scoreOverride) => scoreOverride.matchId === match.id) ?? match
}

function getTeamGoalAdjustment(team: Team, teamGoalAdjustments: TeamGoalAdjustment[]): number {
  return teamGoalAdjustments
    .filter((adjustment) => adjustment.teamId === team.id)
    .reduce((total, adjustment) => total + adjustment.goals, 0)
}

function isPlayedMatch(match: Match): boolean {
  return match.status === 'live' || match.status === 'finished'
}

export function getTeamMatchesPlayed(team: Team, matches: Match[]): number {
  return matches.filter(
    (match) => isPlayedMatch(match) && (match.homeTeamId === team.id || match.awayTeamId === team.id),
  ).length
}

export function getTeamGoals(team: Team, matches: Match[], matchScoreOverrides: MatchScoreOverride[] = [], teamGoalAdjustments: TeamGoalAdjustment[] = []): number {
  const fromMatches = matches.reduce((total, match) => {
    if (match.status === 'scheduled') return total
    const effectiveGoals = getMatchGoals(match, matchScoreOverrides)
    if (match.homeTeamId === team.id) return total + effectiveGoals.homeGoals
    if (match.awayTeamId === team.id) return total + effectiveGoals.awayGoals
    return total
  }, 0)

  return fromMatches + getTeamGoalAdjustment(team, teamGoalAdjustments)
}

export function getAssignedTeams(
  manager: Manager,
  teams: Team[],
  assignments: Assignment[],
  matches: Match[],
  matchScoreOverrides: MatchScoreOverride[] = [],
  teamGoalAdjustments: TeamGoalAdjustment[] = [],
  teamManualOverrides: TeamManualOverride[] = [],
): ScoredTeam[] {
  const effectiveTeams = applyTeamOverrides(teams, matches, teamManualOverrides)
  const teamById = new Map(effectiveTeams.map((team) => [team.id, team]))

  return assignments
    .filter((assignment) => assignment.managerId === manager.id)
    .map((assignment) => teamById.get(assignment.teamId))
    .filter((team): team is Team => team !== undefined)
    .map((team) => ({
      ...team,
      goals: getTeamGoals(team, matches, matchScoreOverrides, teamGoalAdjustments),
      matchesPlayed: getTeamMatchesPlayed(team, matches),
    }))
}


export function getManagerTotal(
  manager: Manager,
  teams: Team[],
  assignments: Assignment[],
  matches: Match[],
  matchScoreOverrides: MatchScoreOverride[] = [],
  teamGoalAdjustments: TeamGoalAdjustment[] = [],
  teamManualOverrides: TeamManualOverride[] = [],
): number {
  return getAssignedTeams(manager, teams, assignments, matches, matchScoreOverrides, teamGoalAdjustments, teamManualOverrides)
    .reduce((sum, team) => sum + team.goals, 0)
}

export function getManagerMatchesPlayed(
  manager: Manager,
  teams: Team[],
  assignments: Assignment[],
  matches: Match[],
  matchScoreOverrides: MatchScoreOverride[] = [],
  teamGoalAdjustments: TeamGoalAdjustment[] = [],
  teamManualOverrides: TeamManualOverride[] = [],
): number {
  return getAssignedTeams(manager, teams, assignments, matches, matchScoreOverrides, teamGoalAdjustments, teamManualOverrides)
    .reduce((sum, team) => sum + team.matchesPlayed, 0)
}

export function getActiveTeamsRemaining(
  manager: Manager,
  teams: Team[],
  assignments: Assignment[],
  matches: Match[],
  matchScoreOverrides: MatchScoreOverride[] = [],
  teamGoalAdjustments: TeamGoalAdjustment[] = [],
  teamManualOverrides: TeamManualOverride[] = [],
): number {
  return getAssignedTeams(manager, teams, assignments, matches, matchScoreOverrides, teamGoalAdjustments, teamManualOverrides)
    .filter((team) => team.status === 'active').length
}

export function rankManagers(
  managers: Manager[], teams: Team[], assignments: Assignment[], matches: Match[],
  matchScoreOverrides: MatchScoreOverride[] = [], teamGoalAdjustments: TeamGoalAdjustment[] = [], teamManualOverrides: TeamManualOverride[] = [],
): RankedManager[] {
  return managers.map((manager) => {
    const assignedTeams = getAssignedTeams(manager, teams, assignments, matches, matchScoreOverrides, teamGoalAdjustments, teamManualOverrides)
    return {
      ...manager,
      teams: assignedTeams,
      totalGoals: assignedTeams.reduce((sum, team) => sum + team.goals, 0),
      activeTeamsRemaining: assignedTeams.filter((team) => team.status === 'active').length,
      totalMatchesPlayed: assignedTeams.reduce((sum, team) => sum + team.matchesPlayed, 0),
      totalKnockoutGoals: assignedTeams.reduce((sum, team) => sum + (team.knockoutGoals ?? 0), 0),
    }
  }).sort((a, b) => b.totalGoals - a.totalGoals
    || b.activeTeamsRemaining - a.activeTeamsRemaining
    || b.totalKnockoutGoals - a.totalKnockoutGoals
    || a.name.localeCompare(b.name))
}
