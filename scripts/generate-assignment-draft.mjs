import fs from 'node:fs/promises'

const managers = JSON.parse(await fs.readFile('src/data/assignments/managers.json', 'utf8'))
const generated = JSON.parse(await fs.readFile('src/data/normalized/generated-data.json', 'utf8'))

function shuffle(list) {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const mappedTeamMap = new Map()
for (const match of generated.matches ?? []) {
  for (const side of ['home', 'away']) {
    const id = match[`${side}TeamId`]
    const name = match[`${side}TeamName`] ?? ''
    if (!id || String(id).startsWith('unmapped:')) continue
    if (/unknown home|unknown away/i.test(String(name))) continue
    mappedTeamMap.set(id, { id, name })
  }
}

const teams = [...mappedTeamMap.values()]
if (teams.length < 48) {
  throw new Error(`Need at least 48 mapped teams from generated data, found ${teams.length}`)
}
if (managers.length !== 10) {
  throw new Error(`Expected 10 managers, found ${managers.length}`)
}

const shuffled = shuffle(teams)
const selectedTeams = shuffled.slice(0, 40)
const unassignedTeams = shuffled.slice(40, 48)

const assignments = managers.map((manager, index) => {
  const chunk = selectedTeams.slice(index * 4, index * 4 + 4)
  return { managerId: manager.id, teamIds: chunk.map((team) => team.id) }
})

const output = {
  generatedAt: new Date().toISOString(),
  note: 'Draft only. Do not treat as official until manually reviewed and copied to src/data/assignments/official-assignments.json.',
  source: generated.source ?? 'unknown',
  assignments,
  unassignedTeams,
}

await fs.mkdir('data/assignment-drafts', { recursive: true })
await fs.writeFile('data/assignment-drafts/generated-assignment-draft.json', `${JSON.stringify(output, null, 2)}\n`)
console.log('Wrote data/assignment-drafts/generated-assignment-draft.json')
