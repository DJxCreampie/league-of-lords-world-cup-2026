# Production Data Flow (Current)

This app uses a single production data path.

## Source files
- Managers: `src/data/assignments/managers.json`
- Official assignments: `src/data/assignments/official-assignments.json`
- Full 48-team pool: derived from `src/data/normalized/generated-data.json`; `src/data/assignments/assignable-teams-2026.json` is only a fallback/static assignment helper
- Match data and scores: `src/data/normalized/generated-data.json`

## Refresh and validation workflow
- `generated-data.json` is refreshed by GitHub Actions **Refresh Data** workflow (`.github/workflows/refresh-data.yml`).
- Run **Refresh Data** before checking current scores; it refreshes from football-data, builds the app, and deploys GitHub Pages directly.
- Run `npm run validate:assignments` after editing official assignments.

## Manual overrides
- Manual override support exists in app logic.
- Default override arrays are empty/inactive by default in `src/productionData.ts`.

## Assignment draft generation
- Assignment draft generation is a local script utility only.
- It is not the official/final assignment workflow and no dedicated draft workflow is kept in production CI.
