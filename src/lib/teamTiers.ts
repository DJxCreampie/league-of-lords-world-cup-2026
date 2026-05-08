import teamTiers from '../data/assignments/team-tiers.json'

const aliasByNormalizedName: Record<string, string> = {
  'congo dr': 'congo',
  'bosnia-herzegovina': 'bosnia',
  }

const teamTierByNormalizedName = Object.entries(teamTiers).reduce<Map<string, number>>((acc, [tier, names]) => {
  const numericTier = Number(tier)
  for (const name of names) {
    acc.set(normalize(name), numericTier)
  }
  return acc
}, new Map())

function normalize(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function getTeamTier(teamName: string): number | undefined {
  const normalized = normalize(teamName)
  const canonical = aliasByNormalizedName[normalized] ?? normalized
  return teamTierByNormalizedName.get(canonical)
}

export function formatTeamTier(teamName: string): string {
  const tier = getTeamTier(teamName)
  return tier ? `Tier ${tier}` : '—'
}

export function sortTeamsByTierThenName<T extends { name: string }>(teams: T[]): T[] {
  return [...teams].sort((a, b) => {
    const aTier = getTeamTier(a.name) ?? Number.POSITIVE_INFINITY
    const bTier = getTeamTier(b.name) ?? Number.POSITIVE_INFINITY
    if (aTier !== bTier) return aTier - bTier
    return a.name.localeCompare(b.name)
  })
}
