import fs from 'node:fs/promises'

const managers = JSON.parse(await fs.readFile('src/data/assignments/managers.json', 'utf8'))
const assignments = JSON.parse(await fs.readFile('src/data/assignments/official-assignments.json', 'utf8'))
const generated = JSON.parse(await fs.readFile('src/data/normalized/generated-data.json', 'utf8'))

const mappedTeamMap = new Map()
const ignoredPlaceholders = new Map()

for (const match of generated.matches ?? []) {
  for (const side of ['home', 'away']) {
    const id = match[`${side}TeamId`]
    const name = match[`${side}TeamName`] ?? ''
    if (!id) continue

    if (String(id).startsWith('unmapped:') || /unknown home|unknown away/i.test(String(name))) {
      ignoredPlaceholders.set(id, name || 'Unknown')
      continue
    }

    mappedTeamMap.set(id, { id, name })
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

  for (const teamId of entry.teamIds) {
    assigned.push(teamId)
    if (seen.has(teamId)) errors.push(`Duplicate team assignment: ${teamId} assigned to ${seen.get(teamId)} and ${entry.managerId}`)
    else seen.set(teamId, entry.managerId)

    if (mappedTeamMap.has(teamId)) {
      validAssignedTeams.add(teamId)
    } else {
      invalidAssignedTeams.add(teamId)
      errors.push(`Assigned team not found in mapped 2026 list: ${teamId}`)
    }
  }
}

const uniqueAssigned = new Set(assigned)
const unassignedTeams = [...mappedTeamMap.keys()].filter((id) => !uniqueAssigned.has(id))

if (uniqueAssigned.size !== 40) errors.push(`Expected 40 assigned teams, found ${uniqueAssigned.size}`)
if (unassignedTeams.length !== 8) errors.push(`Expected 8 unassigned teams, found ${unassignedTeams.length}`)

console.log(`Managers: ${managers.length}`)
console.log(`Mapped teams in generated data: ${mappedTeamMap.size}`)
console.log(`Valid assigned teams: ${validAssignedTeams.size}`)
console.log(`Invalid assigned teams: ${invalidAssignedTeams.size}`)
console.log(`Valid unassigned teams: ${unassignedTeams.length}`)
console.log(`Ignored knockout placeholders: ${ignoredPlaceholders.size}`)

if (invalidAssignedTeams.size > 0) {
  console.log('\nInvalid assigned teamIds:')
  for (const id of [...invalidAssignedTeams].sort()) console.log(`- ${id}`)
}

if (unassignedTeams.length > 0) {
  console.log('\nValid unassigned teamIds:')
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
