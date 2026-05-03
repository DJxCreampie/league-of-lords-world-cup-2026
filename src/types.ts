export type TeamStatus = 'active' | 'eliminated' | 'champion'

export type MatchStatus = 'scheduled' | 'live' | 'finished'

export type Manager = {
  id: string
  name: string
}

export type Team = {
  id: string
  name: string
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
  homeTeamId: string
  awayTeamId: string
  homeGoals: number
  awayGoals: number
  homePenaltyShootoutGoals?: number
  awayPenaltyShootoutGoals?: number
}
