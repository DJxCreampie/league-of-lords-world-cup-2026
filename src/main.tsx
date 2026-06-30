import { StrictMode, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  assignments,
  lastUpdated,
  managers,
  matches,
  matchScoreOverrides,
  teamGoalAdjustments,
  teamManualOverrides,
  teams,
} from './productionData'
import { deriveTeamStatuses, getTeamGoals, getTeamMatchesPlayed, rankManagers } from './scoring'
import { formatTeamTier, sortTeamsByTierThenName } from './lib/teamTiers'
import { addDaysToNewYorkDayKey, formatLastUpdatedNewYork, formatNewYorkDateTime, formatNewYorkDayLabel } from './lib/time'
import { formatMatchFeedScore, formatPenaltyShootoutScore, getDefaultMatchFeedDay, getMatchesForNewYorkDay } from './lib/matchFeed'
import './style.css'

const leaderboard = rankManagers(
  managers,
  teams,
  assignments,
  matches,
  matchScoreOverrides,
  teamGoalAdjustments,
  teamManualOverrides,
)

type SortKey = 'rank' | 'manager' | 'goals' | 'matches' | 'active'
type SortDirection = 'asc' | 'desc'
type TeamsSortKey = 'status' | 'team' | 'manager' | 'goals' | 'matches'

const hasManualOverrides =
  matchScoreOverrides.length > 0 ||
  teamGoalAdjustments.length > 0 ||
  teamManualOverrides.length > 0

const teamById = new Map(teams.map((team) => [team.id, team]))
const derivedStatusByTeamId = deriveTeamStatuses(teams, matches, teamManualOverrides)

const teamGoalsById = new Map(
  teams.map((team) => [
    team.id,
    getTeamGoals(team, matches, matchScoreOverrides, teamGoalAdjustments),
  ]),
)
const managerById = new Map(managers.map((manager) => [manager.id, manager]))

const managerNamesByTeamId = assignments.reduce<Record<string, string[]>>(
  (acc, assignment) => {
    const manager = managerById.get(assignment.managerId)

    if (!manager) return acc

    acc[assignment.teamId] = [...(acc[assignment.teamId] ?? []), manager.name]
    return acc
  },
  {},
)

const completedMatches = matches.filter((match) => match.status === 'finished')
const completedWithGoals = completedMatches.filter(
  (match) => match.homeGoals + match.awayGoals > 0,
)
const upcomingMatches = matches.filter((match) => match.status === 'scheduled')
const upcomingRatio =
  matches.length > 0 ? upcomingMatches.length / matches.length : 0

const isPreTournament =
  completedWithGoals.length === 0 &&
  (completedMatches.length === 0 || upcomingRatio >= 0.8)

const getDisplayStatus = (status: string) => (status === 'eliminated' ? 'Eliminated' : 'Active')
const getStatusClass = (status: string) => (status === 'eliminated' ? 'eliminated' : 'active')

const visibleMatches = matches.filter((match) => {
  const homeTeam = teamById.get(match.homeTeamId)
  const awayTeam = teamById.get(match.awayTeamId)
  const isPlaceholder =
    !homeTeam ||
    !awayTeam ||
    /unknown/i.test(homeTeam.name) ||
    /unknown/i.test(awayTeam.name)

  return !isPlaceholder
})

function App() {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'teams'>(
    'leaderboard',
  )
  const [expandedManagerId, setExpandedManagerId] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('rank')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const sortedLeaderboard = useMemo(() => {
    const withRank = leaderboard.map((manager, index) => ({
      ...manager,
      rank: index + 1,
    }))

    if (sortKey === 'rank') return withRank

    return [...withRank].sort((a, b) => {
      if (sortKey === 'manager') {
        const result = a.name.localeCompare(b.name)
        return sortDirection === 'asc' ? result : -result
      }

      if (sortKey === 'goals') {
        const result = a.totalGoals - b.totalGoals
        return sortDirection === 'asc' ? result : -result
      }

      if (sortKey === 'matches') {
        const result = a.totalMatchesPlayed - b.totalMatchesPlayed
        return sortDirection === 'asc' ? result : -result
      }

      const result = a.activeTeamsRemaining - b.activeTeamsRemaining
      return sortDirection === 'asc' ? result : -result
    })
  }, [sortDirection, sortKey])

  const handleSortChange = (nextSortKey: SortKey) => {
    if (nextSortKey === 'rank') {
      setSortKey('rank')
      setSortDirection('desc')
      return
    }

    if (sortKey === nextSortKey) {
      setSortDirection((current) => (current === 'desc' ? 'asc' : 'desc'))
      return
    }

    setSortKey(nextSortKey)
    setSortDirection(nextSortKey === 'manager' ? 'asc' : 'desc')
  }

  const sortIndicator = (column: SortKey) => {
    if (sortKey !== column) return ''
    return sortDirection === 'asc' ? ' ↑' : ' ↓'
  }

  const [teamsSortKey, setTeamsSortKey] = useState<TeamsSortKey>('team')
  const [teamsSortDirection, setTeamsSortDirection] = useState<SortDirection>('asc')

  const teamsWithManager = useMemo(
    () =>
      [...teams]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((team) => {
          const assignment = assignments.find((item) => item.teamId === team.id)
          const managerName = assignment
            ? managerById.get(assignment.managerId)?.name ?? 'Unknown Manager'
            : 'Unassigned'

          return {
            ...team,
            status: derivedStatusByTeamId.get(team.id) ?? 'active',
            goals: teamGoalsById.get(team.id) ?? 0,
            matchesPlayed: getTeamMatchesPlayed(team, matches),
            managerName,
          }
        }),
    [],
  )

  const sortedTeams = useMemo(() => {
    const sorted = [...teamsWithManager].sort((a, b) => {
      if (teamsSortKey === 'team') return a.name.localeCompare(b.name)
      if (teamsSortKey === 'manager') return a.managerName.localeCompare(b.managerName)
      if (teamsSortKey === 'status') return getDisplayStatus(a.status).localeCompare(getDisplayStatus(b.status))
      if (teamsSortKey === 'matches') return a.matchesPlayed - b.matchesPlayed
      return a.goals - b.goals
    })

    return teamsSortDirection === 'asc' ? sorted : sorted.reverse()
  }, [teamsSortDirection, teamsSortKey, teamsWithManager])

  const handleTeamsSort = (nextSortKey: TeamsSortKey) => {
    if (teamsSortKey === nextSortKey) {
      setTeamsSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }

    setTeamsSortKey(nextSortKey)
    setTeamsSortDirection(nextSortKey === 'goals' || nextSortKey === 'matches' ? 'desc' : 'asc')
  }

  const teamsSortIndicator = (column: TeamsSortKey) => {
    if (teamsSortKey !== column) return ''
    return teamsSortDirection === 'asc' ? ' ↑' : ' ↓'
  }

  const unassignedCount = teamsWithManager.filter(
    (team) => team.managerName === 'Unassigned',
  ).length

  const [selectedDay, setSelectedDay] = useState<string | null>(() => getDefaultMatchFeedDay())

  const [selectedManager, setSelectedManager] = useState<string>('all')

  const managerFilterOptions = useMemo(
    () => [...managers].map((manager) => manager.name).sort((a, b) => a.localeCompare(b)),
    [],
  )

  const matchesForSelectedDay = getMatchesForNewYorkDay(visibleMatches, selectedDay).filter((match) => {
    if (selectedManager === 'all') return true

    const homeManagers = managerNamesByTeamId[match.homeTeamId] ?? []
    const awayManagers = managerNamesByTeamId[match.awayTeamId] ?? []

    return [...homeManagers, ...awayManagers].includes(selectedManager)
  })

  return (
    <main className="app-shell">
      <header className="page-header">
        <h1>League of Lords World Cup 2026</h1>
        <span>Last updated: {formatLastUpdatedNewYork(lastUpdated)}</span>
        {hasManualOverrides && <small>Manual scoring corrections applied</small>}
      </header>

      <nav className="tab-nav" aria-label="Dashboard views">
        <button
          className={activeTab === 'leaderboard' ? 'tab active' : 'tab'}
          type="button"
          onClick={() => setActiveTab('leaderboard')}
        >
          Leaderboard
        </button>
        <button
          className={activeTab === 'teams' ? 'tab active' : 'tab'}
          type="button"
          onClick={() => setActiveTab('teams')}
        >
          Teams
        </button>
      </nav>

      {isPreTournament && (
        <section className="panel banner">
          World Cup matches have not started yet. Leaderboard will update once
          goals are recorded.
        </section>
      )}

      {activeTab === 'leaderboard' && (
        <section className="panel">
          <h2>Leaderboard</h2>
          {isPreTournament && (
            <p className="subtle-state">
              Pre-tournament state: totals remain at 0 until matches begin.
            </p>
          )}

          <div className="leaderboard-table-header" role="row">
            <button type="button" className="header-cell" onClick={() => handleSortChange('rank')}>
              Rank{sortIndicator('rank')}
            </button>
            <button type="button" className="header-cell" onClick={() => handleSortChange('manager')}>
              Manager{sortIndicator('manager')}
            </button>
            <button type="button" className="header-cell" onClick={() => handleSortChange('goals')}>
              Goals{sortIndicator('goals')}
            </button>
            <button type="button" className="header-cell" onClick={() => handleSortChange('matches')}>
              Matches{sortIndicator('matches')}
            </button>
            <button type="button" className="header-cell" onClick={() => handleSortChange('active')}>
              Active{sortIndicator('active')}
            </button>
          </div>

          <ol className="leaderboard-list">
            {sortedLeaderboard.map((manager) => {
              const isExpanded = expandedManagerId === manager.id

              return (
                <li key={manager.id}>
                  <button
                    className="leaderboard-row"
                    type="button"
                    onClick={() =>
                      setExpandedManagerId((current) =>
                        current === manager.id ? null : manager.id,
                      )
                    }
                  >
                    <span className="rank">#{manager.rank}</span>
                    <span className="manager-name">{manager.name}</span>
                    <span>{manager.totalGoals}</span>
                    <span>{manager.totalMatchesPlayed}</span>
                    <span>{manager.activeTeamsRemaining}</span>
                  </button>

                  {isExpanded && (
                    <div className="expanded-teams-wrap">
                      <div className="expanded-teams-header">
                        <span>Status</span>
                        <span>Tier</span>
                        <span>Team</span>
                        <span>Goals</span>
                        <span>Matches</span>
                      </div>
                      <ul className="expanded-teams">
                        {sortTeamsByTierThenName(manager.teams).map((team) => (
                          <li
                            className={`detail-team-row ${team.status === 'eliminated' ? 'is-eliminated' : ''}`}
                            key={team.id}
                          >
                            <span className={`status ${getStatusClass(team.status)}`}>
                              {getDisplayStatus(team.status)}
                            </span>
                            <span>{formatTeamTier(team.name).replace('Tier ', '')}</span>
                            <span>{team.name}</span>
                            <span>{team.goals}</span>
                            <span>{team.matchesPlayed}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              )
            })}
          </ol>
        </section>
      )}

      {activeTab === 'teams' && (
        <section className="panel">
          <h2>Teams</h2>
          <p className="subtle-state">
            All 48 teams are shown. Unassigned: {unassignedCount}
          </p>

          <div className="teams-table-header">
            <button type="button" className="teams-header-cell" onClick={() => handleTeamsSort('status')}>Status{teamsSortIndicator('status')}</button>
            <button type="button" className="teams-header-cell" onClick={() => handleTeamsSort('team')}>Team{teamsSortIndicator('team')}</button>
            <button type="button" className="teams-header-cell" onClick={() => handleTeamsSort('manager')}>Manager{teamsSortIndicator('manager')}</button>
            <button type="button" className="teams-header-cell" onClick={() => handleTeamsSort('goals')}>Goals{teamsSortIndicator('goals')}</button>
            <button type="button" className="teams-header-cell" onClick={() => handleTeamsSort('matches')}>Matches{teamsSortIndicator('matches')}</button>
          </div>

          <ul className="teams-list">
            {sortedTeams.map((team) => (
              <li className={`teams-row ${team.status === 'eliminated' ? 'is-eliminated' : ''}`} key={team.id}>
                <span className={`status ${getStatusClass(team.status)}`}>
                  {getDisplayStatus(team.status)}
                </span>
                <span>{team.name}</span>
                <span>{team.managerName}</span>
                <span>{team.goals}</span>
                <span>{team.matchesPlayed}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {activeTab === 'leaderboard' && (
        <>
      <section className="panel">
        <h2>Match Feed</h2>
        <div className="feed-nav">
          <button
            type="button"
            className="tab"
            onClick={() => {
              setSelectedDay((current) => current ? addDaysToNewYorkDayKey(current, -1) : getDefaultMatchFeedDay())
            }}
          >
            Previous day
          </button>
          <span className="feed-day-label">
            {formatNewYorkDayLabel(selectedDay)}
          </span>
          <label className="feed-filter">
            <span>Manager</span>
            <select
              value={selectedManager}
              onChange={(event) => setSelectedManager(event.target.value)}
            >
              <option value="all">All managers</option>
              {managerFilterOptions.map((managerName) => (
                <option key={managerName} value={managerName}>
                  {managerName}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="tab"
            onClick={() => {
              setSelectedDay((current) => current ? addDaysToNewYorkDayKey(current, 1) : getDefaultMatchFeedDay())
            }}
          >
            Next day
          </button>
        </div>

        <ul className="feed-list">
          {matchesForSelectedDay.length === 0 && (
            <li className="feed-empty">No matches scheduled for this day.</li>
          )}
          {matchesForSelectedDay.map((match) => {
            const homeTeam = teamById.get(match.homeTeamId)
            const awayTeam = teamById.get(match.awayTeamId)
            const homeManagers = managerNamesByTeamId[match.homeTeamId] ?? []
            const awayManagers = managerNamesByTeamId[match.awayTeamId] ?? []

            return (
              <li className="feed-item" key={match.id}>
                <strong>
                  {formatMatchFeedScore(match, homeTeam?.name, awayTeam?.name)}
                </strong>
                {formatPenaltyShootoutScore(match, homeTeam?.name, awayTeam?.name) && (
                  <p>{formatPenaltyShootoutScore(match, homeTeam?.name, awayTeam?.name)}</p>
                )}
                <p>{formatNewYorkDateTime(match.kickoffTime)}</p>
                <ul className="impact-list">
                  <li>
                    {homeTeam?.name} → {homeManagers.join(', ') || 'Unassigned'}
                  </li>
                  <li>
                    {awayTeam?.name} → {awayManagers.join(', ') || 'Unassigned'}
                  </li>
                </ul>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="panel">
        <h2>Rules</h2>

        <ul className="rules-list">
          <li>Each manager gets 4 World Cup teams.</li>
          <li>Manager score equals total goals scored by assigned teams.</li>
          <li>Group stage and knockout goals count.</li>
          <li>Penalty shootout goals do not count.</li>
          <li>Eliminated teams keep their final goal total.</li>
          <li>48 teams exist and 40 are assigned, so 8 may remain unassigned.</li>
          <li>Manual overrides may be used if live data is wrong.</li>
        </ul>
      </section>
        </>
      )}
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
