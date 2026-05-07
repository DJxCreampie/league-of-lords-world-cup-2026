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
} from './mockData'
import { rankManagers } from './scoring'
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

type SortKey = 'rank' | 'manager' | 'goals' | 'active'
type SortDirection = 'asc' | 'desc'

const hasManualOverrides =
  matchScoreOverrides.length > 0 ||
  teamGoalAdjustments.length > 0 ||
  teamManualOverrides.length > 0

const teamById = new Map(teams.map((team) => [team.id, team]))
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

function formatKickoff(kickoffTime?: string): string {
  if (!kickoffTime) return 'Kickoff TBD'

  const date = new Date(kickoffTime)

  return Number.isNaN(date.getTime()) ? 'Kickoff TBD' : date.toLocaleString()
}

function getMatchDayKey(kickoffTime?: string): string | null {
  if (!kickoffTime) return null

  const date = new Date(kickoffTime)
  if (Number.isNaN(date.getTime())) return null

  return date.toISOString().slice(0, 10)
}

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

  const teamsWithManager = useMemo(
    () =>
      teams.map((team) => {
        const assignment = assignments.find((item) => item.teamId === team.id)
        const managerName = assignment
          ? managerById.get(assignment.managerId)?.name ?? 'Unknown Manager'
          : 'Unassigned'

        return { ...team, managerName }
      }),
    [],
  )

  const unassignedCount = teamsWithManager.filter(
    (team) => team.managerName === 'Unassigned',
  ).length

  const matchDays = useMemo(() => {
    const daySet = new Set<string>()
    visibleMatches.forEach((match) => {
      const dayKey = getMatchDayKey(match.kickoffTime)
      if (dayKey) daySet.add(dayKey)
    })

    return [...daySet].sort((a, b) => a.localeCompare(b))
  }, [])

  const [selectedDay, setSelectedDay] = useState<string | null>(() => {
    const scheduledDay = visibleMatches
      .filter((match) => match.status === 'scheduled')
      .map((match) => getMatchDayKey(match.kickoffTime))
      .filter((day): day is string => Boolean(day))
      .sort((a, b) => a.localeCompare(b))[0]

    return scheduledDay ?? matchDays[0] ?? null
  })

  const selectedDayIndex = selectedDay ? matchDays.indexOf(selectedDay) : -1
  const matchesForSelectedDay = visibleMatches.filter((match) => {
    if (!selectedDay) return false
    return getMatchDayKey(match.kickoffTime) === selectedDay
  })

  return (
    <main className="app-shell">
      <header className="page-header">
        <h1>League of Lords World Cup 2026</h1>
        <span>Last updated: {lastUpdated}</span>
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
                    <span>{manager.activeTeamsRemaining}</span>
                  </button>

                  {isExpanded && (
                    <div className="expanded-teams-wrap">
                      <div className="expanded-teams-header">
                        <span>Team</span>
                        <span>Status</span>
                        <span>Goals</span>
                      </div>
                      <ul className="expanded-teams">
                        {manager.teams.map((team) => (
                          <li className="detail-team-row" key={team.id}>
                            <span>{team.name}</span>
                            <span className={`status ${team.status}`}>{team.status}</span>
                            <span>{team.goals}</span>
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

          <ul className="teams-list">
            {teamsWithManager.map((team) => (
              <li className="teams-row" key={team.id}>
                <span>{team.name}</span>
                <span>Group {team.group ?? 'TBD'}</span>
                <span>{team.managerName}</span>
                <span>{team.goalsFor ?? 0} goals</span>
                <span className={`status ${team.status}`}>{team.status}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="panel">
        <h2>Match Feed</h2>
        <div className="feed-nav">
          <button
            type="button"
            className="tab"
            onClick={() => {
              if (selectedDayIndex > 0) setSelectedDay(matchDays[selectedDayIndex - 1])
            }}
            disabled={selectedDayIndex <= 0}
          >
            Previous day
          </button>
          <span className="feed-day-label">
            {selectedDay
              ? new Date(`${selectedDay}T00:00:00Z`).toLocaleDateString()
              : 'No dated matches'}
          </span>
          <button
            type="button"
            className="tab"
            onClick={() => {
              if (selectedDayIndex >= 0 && selectedDayIndex < matchDays.length - 1) {
                setSelectedDay(matchDays[selectedDayIndex + 1])
              }
            }}
            disabled={selectedDayIndex === -1 || selectedDayIndex >= matchDays.length - 1}
          >
            Next day
          </button>
        </div>

        <ul className="feed-list">
          {matchesForSelectedDay.map((match) => {
            const homeTeam = teamById.get(match.homeTeamId)
            const awayTeam = teamById.get(match.awayTeamId)
            const homeManagers = managerNamesByTeamId[match.homeTeamId] ?? []
            const awayManagers = managerNamesByTeamId[match.awayTeamId] ?? []
            const uniqueManagers = [...new Set([...homeManagers, ...awayManagers])]

            return (
              <li className="feed-item" key={match.id}>
                <strong>
                  {match.status === 'scheduled'
                    ? `Upcoming · ${homeTeam?.name} vs ${awayTeam?.name}`
                    : `${match.status.toUpperCase()} · ${homeTeam?.name} ${match.homeGoals} - ${match.awayGoals} ${awayTeam?.name}`}
                </strong>
                <p>{formatKickoff(match.kickoffTime)}</p>
                <ul className="impact-list">
                  <li>
                    {homeTeam?.name} → {homeManagers.join(', ') || 'Unassigned'}
                  </li>
                  <li>
                    {awayTeam?.name} → {awayManagers.join(', ') || 'Unassigned'}
                  </li>
                </ul>
                <p>
                  Impacted manager{uniqueManagers.length === 1 ? '' : 's'}:{' '}
                  {uniqueManagers.join(', ') || 'None (unassigned teams)'}
                </p>
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
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
