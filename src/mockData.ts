import type {
  Assignment,
  Manager,
  Match,
  MatchScoreOverride,
  Team,
  TeamGoalAdjustment,
  TeamManualOverride,
} from './types'

export const lastUpdated = 'May 3, 2026 at 10:45 AM ET'

export const managers: Manager[] = [
  { id: 'manager-1', name: 'Avery Stone' },
  { id: 'manager-2', name: 'Maya Brooks' },
  { id: 'manager-3', name: 'Theo Park' },
  { id: 'manager-4', name: 'Nora Patel' },
  { id: 'manager-5', name: 'Leo Martinez' },
  { id: 'manager-6', name: 'Iris Chen' },
  { id: 'manager-7', name: 'Sam Rivera' },
  { id: 'manager-8', name: 'Quinn Morgan' },
  { id: 'manager-9', name: 'Elena Rossi' },
  { id: 'manager-10', name: 'Jules Carter' },
]

const baseTeams: Array<Pick<Team, 'id' | 'name' | 'status'>> = [
  { id: 'team-brazil', name: 'Brazil', status: 'active' },
  { id: 'team-japan', name: 'Japan', status: 'eliminated' },
  { id: 'team-morocco', name: 'Morocco', status: 'active' },
  { id: 'team-canada', name: 'Canada', status: 'eliminated' },
  { id: 'team-france', name: 'France', status: 'champion' },
  { id: 'team-ghana', name: 'Ghana', status: 'eliminated' },
  { id: 'team-uruguay', name: 'Uruguay', status: 'active' },
  { id: 'team-south-korea', name: 'South Korea', status: 'eliminated' },
  { id: 'team-argentina', name: 'Argentina', status: 'active' },
  { id: 'team-switzerland', name: 'Switzerland', status: 'eliminated' },
  { id: 'team-senegal', name: 'Senegal', status: 'active' },
  { id: 'team-saudi-arabia', name: 'Saudi Arabia', status: 'eliminated' },
  { id: 'team-england', name: 'England', status: 'active' },
  { id: 'team-mexico', name: 'Mexico', status: 'eliminated' },
  { id: 'team-croatia', name: 'Croatia', status: 'active' },
  { id: 'team-qatar', name: 'Qatar', status: 'eliminated' },
  { id: 'team-spain', name: 'Spain', status: 'active' },
  { id: 'team-cameroon', name: 'Cameroon', status: 'eliminated' },
  { id: 'team-united-states', name: 'United States', status: 'active' },
  { id: 'team-wales', name: 'Wales', status: 'eliminated' },
  { id: 'team-portugal', name: 'Portugal', status: 'active' },
  { id: 'team-ecuador', name: 'Ecuador', status: 'eliminated' },
  { id: 'team-serbia', name: 'Serbia', status: 'eliminated' },
  { id: 'team-australia', name: 'Australia', status: 'active' },
  { id: 'team-netherlands', name: 'Netherlands', status: 'active' },
  { id: 'team-poland', name: 'Poland', status: 'eliminated' },
  { id: 'team-tunisia', name: 'Tunisia', status: 'eliminated' },
  { id: 'team-costa-rica', name: 'Costa Rica', status: 'eliminated' },
  { id: 'team-germany', name: 'Germany', status: 'eliminated' },
  { id: 'team-denmark', name: 'Denmark', status: 'eliminated' },
  { id: 'team-iran', name: 'Iran', status: 'eliminated' },
  { id: 'team-belgium', name: 'Belgium', status: 'active' },
  { id: 'team-italy', name: 'Italy', status: 'eliminated' },
  { id: 'team-chile', name: 'Chile', status: 'eliminated' },
  { id: 'team-nigeria', name: 'Nigeria', status: 'active' },
  { id: 'team-new-zealand', name: 'New Zealand', status: 'eliminated' },
  { id: 'team-colombia', name: 'Colombia', status: 'active' },
  { id: 'team-peru', name: 'Peru', status: 'eliminated' },
  { id: 'team-egypt', name: 'Egypt', status: 'eliminated' },
  { id: 'team-scotland', name: 'Scotland', status: 'eliminated' },
  { id: 'team-norway', name: 'Norway', status: 'active' },
  { id: 'team-sweden', name: 'Sweden', status: 'active' },
  { id: 'team-ireland', name: 'Ireland', status: 'eliminated' },
  { id: 'team-greece', name: 'Greece', status: 'eliminated' },
  { id: 'team-turkey', name: 'Turkey', status: 'active' },
  { id: 'team-ukraine', name: 'Ukraine', status: 'eliminated' },
  { id: 'team-paraguay', name: 'Paraguay', status: 'eliminated' },
  { id: 'team-ivory-coast', name: 'Ivory Coast', status: 'active' },
]

const TEAM_GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

export const teams: Team[] = baseTeams.map((team, index) => ({
  ...team,
  shortName: team.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase(),
  group: TEAM_GROUPS[index % TEAM_GROUPS.length],
  goalsFor: 0,
  knockoutGoals: 0,
}))

export const assignments: Assignment[] = [
  { managerId: 'manager-1', teamId: 'team-brazil' },
  { managerId: 'manager-1', teamId: 'team-japan' },
  { managerId: 'manager-1', teamId: 'team-morocco' },
  { managerId: 'manager-1', teamId: 'team-canada' },
  { managerId: 'manager-2', teamId: 'team-france' },
  { managerId: 'manager-2', teamId: 'team-ghana' },
  { managerId: 'manager-2', teamId: 'team-uruguay' },
  { managerId: 'manager-2', teamId: 'team-south-korea' },
  { managerId: 'manager-3', teamId: 'team-argentina' },
  { managerId: 'manager-3', teamId: 'team-switzerland' },
  { managerId: 'manager-3', teamId: 'team-senegal' },
  { managerId: 'manager-3', teamId: 'team-saudi-arabia' },
  { managerId: 'manager-4', teamId: 'team-england' },
  { managerId: 'manager-4', teamId: 'team-mexico' },
  { managerId: 'manager-4', teamId: 'team-croatia' },
  { managerId: 'manager-4', teamId: 'team-qatar' },
  { managerId: 'manager-5', teamId: 'team-spain' },
  { managerId: 'manager-5', teamId: 'team-cameroon' },
  { managerId: 'manager-5', teamId: 'team-united-states' },
  { managerId: 'manager-5', teamId: 'team-wales' },
  { managerId: 'manager-6', teamId: 'team-portugal' },
  { managerId: 'manager-6', teamId: 'team-ecuador' },
  { managerId: 'manager-6', teamId: 'team-serbia' },
  { managerId: 'manager-6', teamId: 'team-australia' },
  { managerId: 'manager-7', teamId: 'team-netherlands' },
  { managerId: 'manager-7', teamId: 'team-poland' },
  { managerId: 'manager-7', teamId: 'team-tunisia' },
  { managerId: 'manager-7', teamId: 'team-costa-rica' },
  { managerId: 'manager-8', teamId: 'team-germany' },
  { managerId: 'manager-8', teamId: 'team-denmark' },
  { managerId: 'manager-8', teamId: 'team-iran' },
  { managerId: 'manager-8', teamId: 'team-belgium' },
  { managerId: 'manager-9', teamId: 'team-italy' },
  { managerId: 'manager-9', teamId: 'team-chile' },
  { managerId: 'manager-9', teamId: 'team-nigeria' },
  { managerId: 'manager-9', teamId: 'team-new-zealand' },
  { managerId: 'manager-10', teamId: 'team-colombia' },
  { managerId: 'manager-10', teamId: 'team-peru' },
  { managerId: 'manager-10', teamId: 'team-egypt' },
  { managerId: 'manager-10', teamId: 'team-scotland' },
]

export const matches: Match[] = [
  { id: 'match-brazil-norway', stage: 'Group', status: 'finished', homeTeamId: 'team-brazil', awayTeamId: 'team-norway', homeGoals: 10, awayGoals: 0 },
  { id: 'match-brazil-sweden-live', stage: 'Quarterfinal', status: 'live', homeTeamId: 'team-brazil', awayTeamId: 'team-sweden', homeGoals: 2, awayGoals: 1 },
  { id: 'match-japan-sweden-scheduled', stage: 'Friendly', status: 'scheduled', kickoffTime: '2026-06-12T18:00:00Z', homeTeamId: 'team-japan', awayTeamId: 'team-sweden', homeGoals: 99, awayGoals: 99 },
  { id: 'match-japan-ireland', stage: 'Group', status: 'finished', homeTeamId: 'team-japan', awayTeamId: 'team-ireland', homeGoals: 7, awayGoals: 0 },
  { id: 'match-morocco-greece', stage: 'Group', status: 'finished', homeTeamId: 'team-morocco', awayTeamId: 'team-greece', homeGoals: 8, awayGoals: 0 },
  { id: 'match-canada-ukraine', stage: 'Group', status: 'finished', homeTeamId: 'team-canada', awayTeamId: 'team-ukraine', homeGoals: 3, awayGoals: 0 },
  { id: 'match-france-ghana-shootout', stage: 'Final', status: 'finished', homeTeamId: 'team-france', awayTeamId: 'team-ghana', homeGoals: 14, awayGoals: 5, homePenaltyShootoutGoals: 4, awayPenaltyShootoutGoals: 3 },
  { id: 'match-uruguay-paraguay', stage: 'Group', status: 'finished', homeTeamId: 'team-uruguay', awayTeamId: 'team-paraguay', homeGoals: 6, awayGoals: 0 },
  { id: 'match-south-korea-ivory-coast', stage: 'Group', status: 'finished', homeTeamId: 'team-south-korea', awayTeamId: 'team-ivory-coast', homeGoals: 4, awayGoals: 0 },
  { id: 'match-argentina-norway', stage: 'Group', status: 'finished', homeTeamId: 'team-argentina', awayTeamId: 'team-norway', homeGoals: 13, awayGoals: 0 },
  { id: 'match-switzerland-sweden', stage: 'Group', status: 'finished', homeTeamId: 'team-switzerland', awayTeamId: 'team-sweden', homeGoals: 6, awayGoals: 0 },
  { id: 'match-senegal-ireland', stage: 'Group', status: 'finished', homeTeamId: 'team-senegal', awayTeamId: 'team-ireland', homeGoals: 7, awayGoals: 0 },
  { id: 'match-saudi-arabia-greece', stage: 'Group', status: 'finished', homeTeamId: 'team-saudi-arabia', awayTeamId: 'team-greece', homeGoals: 2, awayGoals: 0 },
  { id: 'match-england-turkey', stage: 'Group', status: 'finished', homeTeamId: 'team-england', awayTeamId: 'team-turkey', homeGoals: 11, awayGoals: 0 },
  { id: 'match-mexico-ukraine', stage: 'Group', status: 'finished', homeTeamId: 'team-mexico', awayTeamId: 'team-ukraine', homeGoals: 5, awayGoals: 0 },
  { id: 'match-croatia-paraguay', stage: 'Group', status: 'finished', homeTeamId: 'team-croatia', awayTeamId: 'team-paraguay', homeGoals: 7, awayGoals: 0 },
  { id: 'match-qatar-ivory-coast', stage: 'Group', status: 'finished', homeTeamId: 'team-qatar', awayTeamId: 'team-ivory-coast', homeGoals: 1, awayGoals: 0 },
  { id: 'match-spain-norway', stage: 'Group', status: 'finished', homeTeamId: 'team-spain', awayTeamId: 'team-norway', homeGoals: 10, awayGoals: 0 },
  { id: 'match-cameroon-sweden', stage: 'Group', status: 'finished', homeTeamId: 'team-cameroon', awayTeamId: 'team-sweden', homeGoals: 4, awayGoals: 0 },
  { id: 'match-united-states-ireland', stage: 'Group', status: 'finished', homeTeamId: 'team-united-states', awayTeamId: 'team-ireland', homeGoals: 6, awayGoals: 0 },
  { id: 'match-wales-greece', stage: 'Group', status: 'finished', homeTeamId: 'team-wales', awayTeamId: 'team-greece', homeGoals: 2, awayGoals: 0 },
  { id: 'match-portugal-turkey', stage: 'Group', status: 'finished', homeTeamId: 'team-portugal', awayTeamId: 'team-turkey', homeGoals: 9, awayGoals: 0 },
  { id: 'match-ecuador-ukraine', stage: 'Group', status: 'finished', homeTeamId: 'team-ecuador', awayTeamId: 'team-ukraine', homeGoals: 5, awayGoals: 0 },
  { id: 'match-serbia-paraguay', stage: 'Group', status: 'finished', homeTeamId: 'team-serbia', awayTeamId: 'team-paraguay', homeGoals: 4, awayGoals: 0 },
  { id: 'match-australia-ivory-coast', stage: 'Group', status: 'finished', homeTeamId: 'team-australia', awayTeamId: 'team-ivory-coast', homeGoals: 6, awayGoals: 0 },
  { id: 'match-netherlands-norway', stage: 'Group', status: 'finished', homeTeamId: 'team-netherlands', awayTeamId: 'team-norway', homeGoals: 8, awayGoals: 0 },
  { id: 'match-poland-sweden', stage: 'Group', status: 'finished', homeTeamId: 'team-poland', awayTeamId: 'team-sweden', homeGoals: 4, awayGoals: 0 },
  { id: 'match-tunisia-ireland', stage: 'Group', status: 'finished', homeTeamId: 'team-tunisia', awayTeamId: 'team-ireland', homeGoals: 3, awayGoals: 0 },
  { id: 'match-costa-rica-greece', stage: 'Group', status: 'finished', homeTeamId: 'team-costa-rica', awayTeamId: 'team-greece', homeGoals: 2, awayGoals: 0 },
  { id: 'match-germany-turkey', stage: 'Group', status: 'finished', homeTeamId: 'team-germany', awayTeamId: 'team-turkey', homeGoals: 7, awayGoals: 0 },
  { id: 'match-denmark-ukraine', stage: 'Group', status: 'finished', homeTeamId: 'team-denmark', awayTeamId: 'team-ukraine', homeGoals: 3, awayGoals: 0 },
  { id: 'match-iran-paraguay', stage: 'Group', status: 'finished', homeTeamId: 'team-iran', awayTeamId: 'team-paraguay', homeGoals: 4, awayGoals: 0 },
  { id: 'match-belgium-ivory-coast', stage: 'Group', status: 'finished', homeTeamId: 'team-belgium', awayTeamId: 'team-ivory-coast', homeGoals: 5, awayGoals: 0 },
  { id: 'match-italy-norway', stage: 'Group', status: 'finished', homeTeamId: 'team-italy', awayTeamId: 'team-norway', homeGoals: 6, awayGoals: 0 },
  { id: 'match-chile-sweden', stage: 'Group', status: 'finished', homeTeamId: 'team-chile', awayTeamId: 'team-sweden', homeGoals: 4, awayGoals: 0 },
  { id: 'match-nigeria-ireland', stage: 'Group', status: 'finished', homeTeamId: 'team-nigeria', awayTeamId: 'team-ireland', homeGoals: 5, awayGoals: 0 },
  { id: 'match-new-zealand-greece', stage: 'Group', status: 'finished', homeTeamId: 'team-new-zealand', awayTeamId: 'team-greece', homeGoals: 1, awayGoals: 0 },
  { id: 'match-colombia-turkey', stage: 'Group', status: 'finished', homeTeamId: 'team-colombia', awayTeamId: 'team-turkey', homeGoals: 5, awayGoals: 0 },
  { id: 'match-peru-ukraine', stage: 'Group', status: 'finished', homeTeamId: 'team-peru', awayTeamId: 'team-ukraine', homeGoals: 3, awayGoals: 0 },
  { id: 'match-egypt-paraguay', stage: 'Group', status: 'finished', homeTeamId: 'team-egypt', awayTeamId: 'team-paraguay', homeGoals: 4, awayGoals: 0 },
  { id: 'match-scotland-ivory-coast', stage: 'Group', status: 'finished', homeTeamId: 'team-scotland', awayTeamId: 'team-ivory-coast', homeGoals: 2, awayGoals: 0 },
]

export const matchScoreOverrides: MatchScoreOverride[] = [
  { matchId: 'match-brazil-norway', homeGoals: 9, awayGoals: 1 },
  { matchId: 'match-france-ghana-shootout', homeGoals: 13, awayGoals: 5 },
]



export const teamManualOverrides: TeamManualOverride[] = [
  {
    teamId: 'team-morocco',
    goalsFor: 12,
    note: 'Manual correction: two delayed group-stage goals added.',
  },
  {
    teamId: 'team-japan',
    status: 'active',
    note: 'Manual correction: federation appeal reversed elimination status.',
  },
]

export const teamGoalAdjustments: TeamGoalAdjustment[] = [
  { teamId: 'team-morocco', goals: 1 },
  { teamId: 'team-canada', goals: -1 },
]


const overrideByMatchId = new Map(matchScoreOverrides.map((override) => [override.matchId, override]))

for (const match of matches) {
  if (match.status === 'scheduled') {
    continue
  }

  const effective = overrideByMatchId.get(match.id) ?? match
  const homeTeam = teams.find((team) => team.id === match.homeTeamId)
  const awayTeam = teams.find((team) => team.id === match.awayTeamId)

  if (homeTeam) {
    homeTeam.goalsFor = (homeTeam.goalsFor ?? 0) + effective.homeGoals
    if (['Round of 32', 'Round of 16', 'Quarterfinal', 'Semifinal', 'Final'].includes(match.stage)) {
      homeTeam.knockoutGoals = (homeTeam.knockoutGoals ?? 0) + effective.homeGoals
    }
  }

  if (awayTeam) {
    awayTeam.goalsFor = (awayTeam.goalsFor ?? 0) + effective.awayGoals
    if (['Round of 32', 'Round of 16', 'Quarterfinal', 'Semifinal', 'Final'].includes(match.stage)) {
      awayTeam.knockoutGoals = (awayTeam.knockoutGoals ?? 0) + effective.awayGoals
    }
  }
}
