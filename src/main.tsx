import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

type TeamStatus = 'active' | 'eliminated' | 'champion'

type Team = {
  name: string
  goals: number
  status: TeamStatus
}

type Manager = {
  name: string
  teams: Team[]
}

const managers: Manager[] = [
  {
    name: 'Avery Stone',
    teams: [
      { name: 'Brazil', goals: 12, status: 'active' },
      { name: 'Japan', goals: 7, status: 'eliminated' },
      { name: 'Morocco', goals: 8, status: 'active' },
      { name: 'Canada', goals: 3, status: 'eliminated' },
    ],
  },
  {
    name: 'Maya Brooks',
    teams: [
      { name: 'France', goals: 14, status: 'champion' },
      { name: 'Ghana', goals: 5, status: 'eliminated' },
      { name: 'Uruguay', goals: 6, status: 'active' },
      { name: 'South Korea', goals: 4, status: 'eliminated' },
    ],
  },
  {
    name: 'Theo Park',
    teams: [
      { name: 'Argentina', goals: 13, status: 'active' },
      { name: 'Switzerland', goals: 6, status: 'eliminated' },
      { name: 'Senegal', goals: 7, status: 'active' },
      { name: 'Saudi Arabia', goals: 2, status: 'eliminated' },
    ],
  },
  {
    name: 'Nora Patel',
    teams: [
      { name: 'England', goals: 11, status: 'active' },
      { name: 'Mexico', goals: 5, status: 'eliminated' },
      { name: 'Croatia', goals: 7, status: 'active' },
      { name: 'Qatar', goals: 1, status: 'eliminated' },
    ],
  },
  {
    name: 'Leo Martinez',
    teams: [
      { name: 'Spain', goals: 10, status: 'active' },
      { name: 'Cameroon', goals: 4, status: 'eliminated' },
      { name: 'United States', goals: 6, status: 'active' },
      { name: 'Wales', goals: 2, status: 'eliminated' },
    ],
  },
  {
    name: 'Iris Chen',
    teams: [
      { name: 'Portugal', goals: 9, status: 'active' },
      { name: 'Ecuador', goals: 5, status: 'eliminated' },
      { name: 'Serbia', goals: 4, status: 'eliminated' },
      { name: 'Australia', goals: 6, status: 'active' },
    ],
  },
  {
    name: 'Sam Rivera',
    teams: [
      { name: 'Netherlands', goals: 8, status: 'active' },
      { name: 'Poland', goals: 4, status: 'eliminated' },
      { name: 'Tunisia', goals: 3, status: 'eliminated' },
      { name: 'Costa Rica', goals: 2, status: 'eliminated' },
    ],
  },
  {
    name: 'Quinn Morgan',
    teams: [
      { name: 'Germany', goals: 7, status: 'eliminated' },
      { name: 'Denmark', goals: 3, status: 'eliminated' },
      { name: 'Iran', goals: 4, status: 'eliminated' },
      { name: 'Belgium', goals: 5, status: 'active' },
    ],
  },
  {
    name: 'Elena Rossi',
    teams: [
      { name: 'Italy', goals: 6, status: 'eliminated' },
      { name: 'Chile', goals: 4, status: 'eliminated' },
      { name: 'Nigeria', goals: 5, status: 'active' },
      { name: 'New Zealand', goals: 1, status: 'eliminated' },
    ],
  },
  {
    name: 'Jules Carter',
    teams: [
      { name: 'Colombia', goals: 5, status: 'active' },
      { name: 'Peru', goals: 3, status: 'eliminated' },
      { name: 'Egypt', goals: 4, status: 'eliminated' },
      { name: 'Scotland', goals: 2, status: 'eliminated' },
    ],
  },
]

const leaderboard = managers
  .map((manager) => ({
    ...manager,
    totalGoals: manager.teams.reduce((sum, team) => sum + team.goals, 0),
  }))
  .sort((a, b) => b.totalGoals - a.totalGoals)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main className="app-shell">
      <section className="leaderboard" aria-labelledby="leaderboard-title">
        <div className="page-header">
          <p>Fantasy World Cup</p>
          <h1 id="leaderboard-title">Leaderboard</h1>
        </div>

        <ol className="manager-list">
          {leaderboard.map((manager, index) => (
            <li className="manager-card" key={manager.name}>
              <div className="manager-summary">
                <span className="rank">#{index + 1}</span>
                <div>
                  <h2>{manager.name}</h2>
                  <p>{manager.totalGoals} total goals</p>
                </div>
              </div>

              <ul className="team-list" aria-label={`${manager.name}'s teams`}>
                {manager.teams.map((team) => (
                  <li className="team-row" key={team.name}>
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
