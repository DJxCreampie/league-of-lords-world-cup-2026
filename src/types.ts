export type TeamStatus = 'active' | 'eliminated' | 'champion' | 'unassigned'

export type MatchStatus = 'scheduled' | 'live' | 'finished'

export type Manager = {
  id: string
  name: string
}

export type Team = {
  id: string
  name: string
  shortName?: string
  group?: string
  goalsFor?: number
  knockoutGoals?: number
  status: TeamStatus
}

export type Assignment = {
  managerId: string
  teamId: string
}

export type Match = {
  id: string
  stage: string
  status: MatchStatus
  kickoffTime?: string
  homeTeamId: string
  awayTeamId: string
  homeGoals: number
  awayGoals: number
  homePenaltyShootoutGoals?: number
  awayPenaltyShootoutGoals?: number
}

export type MatchScoreOverride = {
  matchId: string
  homeGoals: number
  awayGoals: number
}

export type TeamGoalAdjustment = {
  teamId: string
  goals: number
}

export type TeamManualOverride = {
  teamId: string
  goalsFor?: number
  status?: TeamStatus
  note: string
}
