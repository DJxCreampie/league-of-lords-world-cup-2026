# Production Data Flow (Current)

This app uses a single production data path.

## Source files
- Managers: `src/data/assignments/managers.json`
- Official assignments: `src/data/assignments/official-assignments.json`
- Full 48-team pool: `src/data/assignments/assignable-teams-2026.json`
- Match data and scores: `src/data/normalized/generated-data.json`

## Refresh and validation workflow
- `generated-data.json` is refreshed by GitHub Actions **Refresh Data** workflow (`.github/workflows/refresh-mock-data.yml`).
- Run **Refresh Data** before checking current scores.
- Run `npm run validate:assignments` after editing official assignments.

## Manual overrides
- Manual override support exists in app logic.
- Default override arrays are empty/inactive by default.

## Assignment draft generation
- **Generate Assignment Draft** workflow/script is optional utility only.
- It is not the official/final assignment workflow.
