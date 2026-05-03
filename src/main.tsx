import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  assignments,
  lastUpdated,
  managers,
  matches,
  matchScoreOverrides,
  teamGoalAdjustments,
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
)
const hasManualOverrides = matchScoreOverrides.length > 0 || teamGoalAdjustments.length > 0

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main className="app-shell">
      <section className="leaderboard" aria-labelledby="leaderboard-title">
        <div className="page-header">
          <p>Fantasy World Cup</p>
          <h1 id="leaderboard-title">Leaderboard</h1>
          <span>Last updated: {lastUpdated}</span>
          {hasManualOverrides && <small>Manual scoring corrections applied</small>}
        </div>

        <ol className="manager-list">
          {leaderboard.map((manager, index) => (
            <li className="manager-card" key={manager.id}>
              <div className="manager-summary">
                <span className="rank">#{index + 1}</span>
                <div>
                  <h2>{manager.name}</h2>
                  <p>
                    {manager.totalGoals} total goals &middot; {manager.activeTeamsRemaining} active teams
                    remaining
                  </p>
                </div>
              </div>

              <ul className="team-list" aria-label={`${manager.name}'s teams`}>
                {manager.teams.map((team) => (
                  <li className="team-row" key={team.id}>
                    <span className="team-name">{team.name}</span>
                    <span className="team-goals">{team.goals} goals</span>
                    <span className={`status ${team.status}`}>{team.status}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>
    </main>
  </StrictMode>,
)
