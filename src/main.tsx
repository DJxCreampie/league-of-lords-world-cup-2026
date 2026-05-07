import { StrictMode } from 'react'
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

const hasManualOverrides = matchScoreOverrides.length > 0 || teamGoalAdjustments.length > 0 || teamManualOverrides.length > 0
const manualOverrideByTeamId = new Map(teamManualOverrides.map((override) => [override.teamId, override]))
const teamById = new Map(teams.map((team) => [team.id, team]))

const managerNamesByTeamId = assignments.reduce<Record<string, string[]>>((acc, assignment) => {
  const manager = managers.find((item) => item.id === assignment.managerId)
  if (!manager) return acc
  acc[assignment.teamId] = [...(acc[assignment.teamId] ?? []), manager.name]
  return acc
}, {})

const completedMatches = matches.filter((match) => match.status === 'finished')
const completedWithGoals = completedMatches.filter((match) => match.homeGoals + match.awayGoals > 0)
const upcomingMatches = matches.filter((match) => match.status === 'scheduled')
const upcomingRatio = matches.length > 0 ? upcomingMatches.length / matches.length : 0
const isPreTournament = completedWithGoals.length === 0 && (completedMatches.length === 0 || upcomingRatio >= 0.8)

const visibleMatches = matches
  .filter((match) => {
    const homeTeam = teamById.get(match.homeTeamId)
    const awayTeam = teamById.get(match.awayTeamId)
    const isPlaceholder = !homeTeam || !awayTeam || /unknown/i.test(homeTeam.name) || /unknown/i.test(awayTeam.name)
    return !isPlaceholder
  })
  .slice(0, 10)

function formatKickoff(kickoffTime?: string): string {
  if (!kickoffTime) return 'Kickoff TBD'
  const date = new Date(kickoffTime)
  return Number.isNaN(date.getTime()) ? 'Kickoff TBD' : date.toLocaleString()
}

function App() {
  return (
    <main className="app-shell">
      <header className="page-header">
        <p>League of Lords World Cup 2026</p>
        <h1>Draft Order Dashboard</h1>
        <span>Last updated: {lastUpdated}</span>
        {hasManualOverrides && <small>Manual scoring corrections applied</small>}
      </header>

      {isPreTournament && (
        <section className="panel banner" aria-live="polite">
          <strong>World Cup matches have not started yet.</strong> Leaderboard will update once goals are recorded.
        </section>
      )}

      <section className="panel" aria-labelledby="leaderboard-title">
        <h2 id="leaderboard-title">Leaderboard</h2>
        {isPreTournament && <p className="subtle-state">Pre-tournament state: totals remain at 0 until matches begin.</p>}
        <ol className="leaderboard-list">
          {leaderboard.map((manager, index) => (
            <li key={manager.id} className="leaderboard-row">
              <span className="rank">#{index + 1}</span>
              <span className="manager-name">{manager.name}</span>
              <span>{manager.totalGoals} goals</span>
              <span>{manager.activeTeamsRemaining} active</span>
              <span>{manager.teams.map((team) => team.name).join(', ')}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="panel" aria-labelledby="cards-title">
        <h2 id="cards-title">Manager Cards</h2>
        <div className="cards">
          {leaderboard.map((manager) => (
            <article key={manager.id} className="card">
              <h3>{manager.name}</h3>
              <p className="card-total">{manager.totalGoals} total goals</p>
              <ul className="detail-team-list">
                {manager.teams.map((team) => (
                  <li className="detail-team-row" key={team.id}>
                    <span>{team.name} {manualOverrideByTeamId.has(team.id) && <em className="override-badge" title={manualOverrideByTeamId.get(team.id)?.note}>override</em>}</span>
                    <span>{team.goals} goals</span>
                    <span className={`status ${team.status}`}>{team.status}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="panel" aria-labelledby="match-feed-title">
        <h2 id="match-feed-title">Match Feed</h2>
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
                <li key={match.id} className="feed-item">
                  <strong>Upcoming</strong> · {homeTeam?.name} vs {awayTeam?.name}
                  <div>{formatKickoff(match.kickoffTime)}</div>
                  <div>Impacted managers: {impacted.join(', ') || 'None (unassigned teams)'}</div>
                </li>
              )
            }

            return (
              <li key={match.id} className="feed-item">
                <strong>{match.status.toUpperCase()}</strong> · {homeTeam?.name} {match.homeGoals} - {match.awayGoals} {awayTeam?.name}
                <div>Impacted managers: {impacted.join(', ') || 'None (unassigned teams)'}</div>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="panel" aria-labelledby="rules-title">
        <h2 id="rules-title">Rules</h2>
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
