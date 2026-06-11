# API Provider Setup (football-data Production Mode)

## Current production behavior
- `football-data.org` is the production provider.
- The **Refresh Data** workflow refreshes with `football-data` on schedule and by default for manual runs.
- The production app consumes `src/data/normalized/generated-data.json`.
- `npm run update:data:football-data` is the production refresh command.
- `npm run update:data` also defaults to football-data mode.

## football-data.org provider mode
The update script fetches and normalizes football-data.org matches. Legacy mock and spike data flows are removed from production.

### Required environment variables
- `FOOTBALL_DATA_API_KEY` (required)
- `FOOTBALL_DATA_BASE_URL` (optional, default `https://api.football-data.org/v4`)
- `FOOTBALL_DATA_COMPETITION_CODE` (optional, default `WC`)
- `FOOTBALL_DATA_SEASON_YEAR` (optional, default `2026`; use historical seasons only for validation)

### Run commands
- Production football-data mode: `npm run update:data:football-data`
- Equivalent default mode: `npm run update:data`

## Normalized match fields produced
football-data matches are normalized to:
- `matchId`
- `competitionId`
- `competitionCode`
- `competitionName`
- `seasonYear`
- `kickoffTime`
- `status` (`upcoming | live | final | postponed | canceled | unknown`)
- `matchday`
- `stage`
- `group`
- `minute` (currently `null`, free tier does not expose live minute in our production data)
- `homeTeamId`, `homeTeamName`
- `awayTeamId`, `awayTeamName`
- `homeGoals`, `awayGoals`
- `winnerTeamId`
- `sourceProvider` (`football-data.org`)
- `sourceStatus`
- `lastUpdated`

## Scoring rules
- Match scores are calculated from `generatedData.matches` only.
- `generatedData.teams`, if present, is metadata only and must not provide `goalsFor` scoring truth.
- Explicit manual match score overrides and team goal adjustments can adjust scoring.
- Default manual overrides in `src/productionData.ts` are empty/inactive.

## Status mapping
football-data status -> internal status:
- `SCHEDULED`, `TIMED` -> `upcoming`
- `IN_PLAY`, `PAUSED` -> `live`
- `FINISHED` -> `final`
- `POSTPONED`, `SUSPENDED` -> `postponed`
- `CANCELED` -> `canceled`
- anything else -> `unknown`

## Team mapping
- Provider team IDs/names are resolved through `src/data/mappings/teamMapping.ts`.
- Unknown teams are preserved as `unmapped:<apiTeamId>` so update runs do not crash.
- Add aliases when provider naming differs.

## Error handling
football-data mode fails clearly for:
- missing API key
- `401` unauthorized
- `403` plan restriction
- `429` rate limiting
- malformed response shape

It tolerates:
- no matches returned (warns, writes empty match list)
- matches without scores (defaults goals to `0`)
- unknown statuses (`unknown`)
- unknown teams (`unmapped:*` IDs)

## Manual workflow run (GitHub Actions)
Use **Actions → Refresh Data → Run workflow**. Manual runs use `football-data`; optionally override `competition_code` and `season_year`.

`FOOTBALL_DATA_API_KEY` must be configured in repository secrets. The workflow refreshes data, builds the app, commits refreshed normalized data when changed, and deploys GitHub Pages directly.
