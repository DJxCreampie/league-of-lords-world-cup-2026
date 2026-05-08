import fs from 'node:fs/promises'

const managers = JSON.parse(await fs.readFile('src/data/assignments/managers.json', 'utf8'))
const assignments = JSON.parse(await fs.readFile('src/data/assignments/official-assignments.json', 'utf8'))
const generated = JSON.parse(await fs.readFile('src/data/normalized/generated-data.json', 'utf8'))

const UNKNOWN_TEAM_PATTERN = /unknown home|unknown away/i
const ASSIGNMENT_TEAM_ID_ALIASES = {
  'team-bosnia': 'team-bosnia-herzegovina',
  'team-congo': 'team-congo-dr',
}
const normalizeAssignedTeamId = (teamId) => ASSIGNMENT_TEAM_ID_ALIASES[teamId] ?? teamId
const isPlaceholderTeam = (id, name) => String(id).startsWith('unmapped:') || UNKNOWN_TEAM_PATTERN.test(String(name ?? ''))

const mappedTeamMap = new Map()
const ignoredPlaceholders = new Map()

for (const team of generated.teams ?? []) {
  const id = String(team.teamId ?? '')
  const name = String(team.teamName ?? '')
  if (!id) continue
  if (isPlaceholderTeam(id, name)) {
    ignoredPlaceholders.set(id, name || 'Unknown')
    continue
  }
  mappedTeamMap.set(id, { id, name: name || id })
}

for (const match of generated.matches ?? []) {
  for (const side of ['home', 'away']) {
    const id = String(match[`${side}TeamId`] ?? '')
    const name = String(match[`${side}TeamName`] ?? '')
    if (!id) continue

    if (isPlaceholderTeam(id, name)) {
      ignoredPlaceholders.set(id, name || 'Unknown')
      continue
    }

    if (!mappedTeamMap.has(id)) mappedTeamMap.set(id, { id, name: name || id })
  }
}

const managerIds = new Set(managers.map((m) => m.id))
const errors = []
const assigned = []
const seen = new Map()
const validAssignedTeams = new Set()
const invalidAssignedTeams = new Set()

if (managers.length !== 10) errors.push(`Expected 10 managers, found ${managers.length}`)

for (const entry of assignments) {
  if (!managerIds.has(entry.managerId)) errors.push(`Invalid managerId: ${entry.managerId}`)
  const manager = managers.find((m) => m.id === entry.managerId)
  if (manager && entry.managerDisplayName && manager.displayName !== entry.managerDisplayName) {
    errors.push(`managerDisplayName mismatch for ${entry.managerId}: expected "${manager.displayName}", got "${entry.managerDisplayName}"`)
  }
  if (!Array.isArray(entry.teamIds)) {
    errors.push(`managerId ${entry.managerId} has invalid teamIds (not array)`)
    continue
  }
  if (entry.teamIds.length !== 4) errors.push(`managerId ${entry.managerId} has ${entry.teamIds.length} teams (expected 4)`)

  for (const rawTeamId of entry.teamIds) {
    const teamId = normalizeAssignedTeamId(rawTeamId)
    assigned.push(teamId)
    if (seen.has(teamId)) errors.push(`Duplicate team assignment: ${teamId} assigned to ${seen.get(teamId)} and ${entry.managerId}`)
    else seen.set(teamId, entry.managerId)

    if (mappedTeamMap.has(teamId)) validAssignedTeams.add(teamId)
    else {
      invalidAssignedTeams.add(teamId)
      errors.push(`Assigned team not found in generated-data team pool: ${teamId}`)
    }
  }
}

const uniqueAssigned = new Set(assigned)
const unassignedTeams = [...mappedTeamMap.keys()].filter((id) => !uniqueAssigned.has(id))

if (mappedTeamMap.size !== 48) errors.push(`Expected 48 valid assignable teams from generated-data.json, found ${mappedTeamMap.size}`)
if (uniqueAssigned.size !== 40) errors.push(`Expected 40 assigned teams, found ${uniqueAssigned.size}`)
if (unassignedTeams.length !== 8) errors.push(`Expected 8 unassigned teams, found ${unassignedTeams.length}`)

console.log(`Managers: ${managers.length}`)
console.log(`Valid assignable teams (generated-data.json): ${mappedTeamMap.size}`)
console.log(`Assigned valid teams: ${validAssignedTeams.size}`)
console.log(`Invalid assigned teams: ${invalidAssignedTeams.size}`)
console.log(`Unassigned valid teams: ${unassignedTeams.length}`)
console.log(`Ignored knockout placeholders: ${ignoredPlaceholders.size}`)

if (invalidAssignedTeams.size > 0) {
  console.log('\nInvalid assigned teamIds:')
  for (const id of [...invalidAssignedTeams].sort()) console.log(`- ${id}`)
}

if (unassignedTeams.length > 0) {
  console.log('\nUnassigned valid teamIds:')
  for (const id of unassignedTeams.sort()) console.log(`- ${id}`)
}

if (ignoredPlaceholders.size > 0) {
  console.log('\nIgnored placeholder teams:')
  for (const [id, name] of [...ignoredPlaceholders.entries()].sort((a, b) => String(a[1]).localeCompare(String(b[1])))) {
    console.log(`- ${id} (${name})`)
  }
}

if (errors.length) {
  console.log('\nValidation errors:')
  for (const error of errors) console.log(`- ${error}`)
  process.exit(1)
}

console.log('\nAssignment validation passed.')
