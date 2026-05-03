import { describe, expect, it } from 'vitest'
import {
  getActiveTeamsRemaining,
  getManagerTotal,
  rankManagers,
  type Manager,
} from './scoring'

describe('scoring', () => {
  it('sets manager total to the sum of team goals', () => {
    const manager: Manager = {
      name: 'Test Manager',
      teams: [
        { name: 'Team A', goals: 3, status: 'active' },
        { name: 'Team B', goals: 4, status: 'champion' },
        { name: 'Team C', goals: 2, status: 'eliminated' },
        { name: 'Team D', goals: 1, status: 'active' },
      ],
    }

    expect(getManagerTotal(manager)).toBe(10)
  })

  it('ranks managers highest total first', () => {
    const managers: Manager[] = [
      {
        name: 'Middle',
        teams: [
          { name: 'Team A', goals: 4, status: 'active' },
          { name: 'Team B', goals: 2, status: 'active' },
          { name: 'Team C', goals: 1, status: 'eliminated' },
          { name: 'Team D', goals: 1, status: 'eliminated' },
        ],
      },
      {
        name: 'Top',
        teams: [
          { name: 'Team E', goals: 7, status: 'active' },
          { name: 'Team F', goals: 5, status: 'champion' },
          { name: 'Team G', goals: 3, status: 'eliminated' },
          { name: 'Team H', goals: 1, status: 'active' },
        ],
      },
      {
        name: 'Bottom',
        teams: [
          { name: 'Team I', goals: 1, status: 'active' },
          { name: 'Team J', goals: 1, status: 'eliminated' },
          { name: 'Team K', goals: 1, status: 'eliminated' },
          { name: 'Team L', goals: 1, status: 'eliminated' },
        ],
      },
    ]

    expect(rankManagers(managers).map((manager) => manager.name)).toEqual([
      'Top',
      'Middle',
      'Bottom',
    ])
  })

  it('counts eliminated teams toward the manager total', () => {
    const manager: Manager = {
      name: 'Eliminated Counts',
      teams: [
        { name: 'Team A', goals: 0, status: 'active' },
        { name: 'Team B', goals: 2, status: 'eliminated' },
        { name: 'Team C', goals: 5, status: 'eliminated' },
        { name: 'Team D', goals: 1, status: 'champion' },
      ],
    }

    expect(getManagerTotal(manager)).toBe(8)
  })

  it('counts active and champion teams as active teams remaining', () => {
    const manager: Manager = {
      name: 'Still Alive',
      teams: [
        { name: 'Team A', goals: 3, status: 'active' },
        { name: 'Team B', goals: 2, status: 'eliminated' },
        { name: 'Team C', goals: 5, status: 'champion' },
        { name: 'Team D', goals: 1, status: 'eliminated' },
      ],
    }

    expect(getActiveTeamsRemaining(manager)).toBe(2)
  })

  it('adds active teams remaining to ranked managers', () => {
    const managers: Manager[] = [
      {
        name: 'Leader',
        teams: [
          { name: 'Team A', goals: 5, status: 'active' },
          { name: 'Team B', goals: 4, status: 'champion' },
          { name: 'Team C', goals: 3, status: 'eliminated' },
          { name: 'Team D', goals: 2, status: 'eliminated' },
        ],
      },
    ]

    expect(rankManagers(managers)[0].activeTeamsRemaining).toBe(2)
  })
})
