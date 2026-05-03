export type TeamStatus = 'active' | 'eliminated' | 'champion'

export type Manager = {
  id: string
  name: string
}

export type Team = {
  id: string
  name: string
  goals: number
  status: TeamStatus
}

export type Assignment = {
  managerId: string
  teamId: string
}
