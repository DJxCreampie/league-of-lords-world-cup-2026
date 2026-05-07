import { StrictMode, useState } from 'react'
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

function App() {
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null)

  return (
    <main className="app-shell">
      <section className="leaderboard" aria-labelledby="leaderboard-title">
        <div className="page-header">
          <p>League of Lords World Cup 2026</p>
          <h1 id="leaderboard-title">Leaderboard</h1>
          <span>Last updated: {lastUpdated}</span>
          {hasManualOverrides && <small>Manual scoring corrections applied</small>}
        </div>

        <ol className="manager-list">
          {leaderboard.map((manager, index) => {
            const rank = index + 1
            const isSelected = selectedManagerId === manager.id

            return (
              <li className="manager-row" key={manager.id}>
                <button
                  className="manager-toggle"
                  type="button"
                  aria-expanded={isSelected}
                  onClick={() => setSelectedManagerId(isSelected ? null : manager.id)}
                >
                  <span className="rank">#{rank}</span>
                  <span className="manager-name">{manager.name}</span>
                  <span className="manager-total">{manager.totalGoals} goals</span>
                  <span className="manager-active">
                    {manager.activeTeamsRemaining} active teams
                  </span>
                </button>

                {isSelected && (
                  <section className="manager-detail" aria-label={`${manager.name} detail`}>
                    <ul className="detail-team-list" aria-label={`${manager.name} detail teams`}>
                      {manager.teams.map((team) => (
                        <li className="detail-team-row" key={team.id}>
                          <span className="team-name">{team.name}</span>
                          <span className="team-goals">{team.goals} goals</span>
                          <span className={`status ${team.status}`}>{team.status}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </li>
            )
          })}
        </ol>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
