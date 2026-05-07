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

const hasManualOverrides =
  matchScoreOverrides.length > 0 ||
  teamGoalAdjustments.length > 0 ||
  teamManualOverrides.length > 0

const manualOverrideByTeamId = new Map(
  teamManualOverrides.map((override) => [override.teamId, override]),
)

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

const visibleMatches = matches
  .filter((match) => {
    const homeTeam = teamById.get(match.homeTeamId)
    const awayTeam = teamById.get(match.awayTeamId)
    const isPlaceholder =
      !homeTeam ||
      !awayTeam ||
      /unknown/i.test(homeTeam.name) ||
      /unknown/i.test(awayTeam.name)

    return !isPlaceholder
  })
  .slice(0, 10)

function formatKickoff(kickoffTime?: string): string {
  if (!kickoffTime) return 'Kickoff TBD'

  const date = new Date(kickoffTime)

  return Number.isNaN(date.getTime()) ? 'Kickoff TBD' : date.toLocaleString()
}

function App() {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'teams'>(
    'leaderboard',
  )

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

function App() {
  return (
    <main className="app-shell">
      <header className="page-header">
        <p>League of Lords World Cup 2026</p>
        <h1>Draft Order Dashboard</h1>
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
        <>
          <section className="panel">
            <h2>Leaderboard</h2>
            {isPreTournament && (
              <p className="subtle-state">
                Pre-tournament state: totals remain at 0 until matches begin.
              </p>
            )}

            <ol className="leaderboard-list">
              {leaderboard.map((manager, index) => (
                <li className="leaderboard-row" key={manager.id}>
                  <span className="rank">#{index + 1}</span>
                  <span className="manager-name">{manager.name}</span>
                  <span>{manager.totalGoals} goals</span>
                  <span>{manager.activeTeamsRemaining} active</span>
                  <span>
                    {manager.teams.map((team) => team.name).join(', ')}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className="panel">
            <h2>Manager Cards</h2>
            <div className="cards">
              {leaderboard.map((manager) => (
                <article className="card" key={manager.id}>
                  <h3>{manager.name}</h3>
                  <p className="card-total">{manager.totalGoals} total goals</p>

                  <ul className="detail-team-list">
                    {manager.teams.map((team) => (
                      <li className="detail-team-row" key={team.id}>
                        <span>
                          {team.name}
                          {manualOverrideByTeamId.has(team.id) && (
                            <em className="override-badge">override</em>
                          )}
                        </span>
                        <span>{team.goals} goals</span>
                        <span className={`status ${team.status}`}>
                          {team.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        </>
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

        <ul className="feed-list">
          {visibleMatches.map((match) => {
            const homeTeam = teamById.get(match.homeTeamId)
            const awayTeam = teamById.get(match.awayTeamId)
            const impacted = [
              ...(managerNamesByTeamId[match.homeTeamId] ?? []),
              ...(managerNamesByTeamId[match.awayTeamId] ?? []),
            ]

            if (match.status === 'scheduled') {
              return (
                <li className="feed-item" key={match.id}>
                  <strong>
                    Upcoming · {homeTeam?.name} vs {awayTeam?.name}
                  </strong>
                  <p>{formatKickoff(match.kickoffTime)}</p>
                  <p>
                    Impacted managers:{' '}
                    {impacted.join(', ') || 'None (unassigned teams)'}
                  </p>
                </li>
              )
            }

            return (
              <li className="feed-item" key={match.id}>
                <strong>
                  {match.status.toUpperCase()} · {homeTeam?.name}{' '}
                  {match.homeGoals} - {match.awayGoals} {awayTeam?.name}
                </strong>
                <p>
                  Impacted managers:{' '}
                  {impacted.join(', ') || 'None (unassigned teams)'}
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
