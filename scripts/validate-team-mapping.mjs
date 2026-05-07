import fs from 'node:fs/promises'

const data = JSON.parse(await fs.readFile('src/data/normalized/generated-data.json', 'utf8'))
const teamStats = new Map()

for (const match of data.matches ?? []) {
  for (const side of ['home', 'away']) {
    const id = match[`${side}TeamId`]
    const name = match[`${side}TeamName`] ?? 'Unknown'
    if (!id || !name) continue
    const key = `${id}::${name}`
    teamStats.set(key, { id, name })
  }
}

const teams = [...teamStats.values()]
const unmapped = teams.filter((t) => String(t.id).startsWith('unmapped:'))
const expectedPlaceholders = unmapped.filter((t) => /unknown home|unknown away/i.test(t.name))
const realUnmapped = unmapped.filter((t) => !/unknown home|unknown away/i.test(t.name))

console.log(`Total teams found: ${teams.length}`)
console.log(`Mapped teams: ${teams.length - unmapped.length}`)
console.log(`Unmapped teams: ${unmapped.length}`)
console.log(`Expected knockout placeholders: ${expectedPlaceholders.length}`)
console.log(`Unmapped real teams: ${realUnmapped.length}`)

if (unmapped.length > 0) {
  console.log('\nUnmapped team list:')
  for (const team of unmapped.sort((a, b) => a.name.localeCompare(b.name))) {
    const kind = /unknown home|unknown away/i.test(team.name) ? 'placeholder' : 'real-team'
    console.log(`- ${team.id} | ${team.name} | ${kind}`)
  }
}

if (realUnmapped.length > 0) {
  process.exitCode = 2
}
