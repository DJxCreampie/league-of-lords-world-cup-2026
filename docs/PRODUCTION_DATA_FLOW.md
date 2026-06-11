# Production Data Flow

This app uses one production data path.

## Source files
- Managers: `src/data/assignments/managers.json`
- Official assignments: `src/data/assignments/official-assignments.json`
- Provider data: `src/data/normalized/generated-data.json`
- Production provider: `football-data.org`

## Scoring source of truth
- Leaderboard scoring is calculated from `generatedData.matches` only.
- `generatedData.teams`, if present in a future provider payload, is metadata only and is not scoring truth.
- Runtime team `goalsFor` values are not used as score inputs.
- Explicit manual match score overrides and team goal adjustments are supported, but the default override arrays in `src/productionData.ts` remain empty/inactive.

## Team pool and assignments
- The full 48-team pool is derived from normalized provider matches in `src/data/normalized/generated-data.json`.
- Official manager assignments come from `src/data/assignments/official-assignments.json`.
- Each manager must display exactly four teams from the official assignments.

## Refresh and validation workflow
- `generated-data.json` is refreshed by GitHub Actions **Refresh Data** workflow (`.github/workflows/refresh-data.yml`).
- Scheduled and manual refreshes use `football-data.org` by default.
- Refresh Data refreshes data, builds the app, and deploys GitHub Pages directly so the live site updates automatically.
- Run `npm run validate:assignments` after editing official assignments.

## Removed legacy flows
- Old mock standings, mock API samples, provider spike scripts, field-discovery scripts, assignment draft generation, and their workflows are removed from production.
- Stale mock standings must not be mixed into football-data output.
