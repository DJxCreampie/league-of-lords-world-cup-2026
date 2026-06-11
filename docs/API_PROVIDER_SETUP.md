# API Provider Setup (football-data Production Mode)

## Current production behavior
- The **Refresh Data** workflow always refreshes with `football-data`.
- Scheduled and manual refreshes use `football-data` by default.
- The production app consumes `src/data/normalized/generated-data.json`.
- `npm run update:data:football-data` is the production refresh command.

## football-data.org provider mode
The update script fetches and normalizes football-data.org matches when `DATA_SOURCE=football-data` is set.

### Required environment variables for provider mode
- `FOOTBALL_DATA_API_KEY` (required)
- `FOOTBALL_DATA_BASE_URL` (optional, default `https://api.football-data.org/v4`)
- `FOOTBALL_DATA_COMPETITION_CODE` (optional, default `WC`)
- `FOOTBALL_DATA_SEASON_YEAR` (optional, default `2026`; use `2022` for historical validation)

### Run commands
- Production football-data mode:
  - `npm run update:data:football-data`
  - or `DATA_SOURCE=football-data FOOTBALL_DATA_SEASON_YEAR=2022 npm run update:data`

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
- `minute` (currently `null`, free tier does not expose live minute in our discovery)
- `homeTeamId`, `homeTeamName`
- `awayTeamId`, `awayTeamName`
- `homeGoals`, `awayGoals`
- `winnerTeamId`
- `sourceProvider` (`football-data.org`)
- `sourceStatus`
- `lastUpdated`

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
- Add aliases when provider naming differs (e.g., USA/United States, IR Iran/Iran, Korea Republic/South Korea, Netherlands/Holland).

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

`FOOTBALL_DATA_API_KEY` must be configured in repository secrets. The workflow refreshes data, builds the app, and deploys GitHub Pages directly.

## Delayed scores + live minute
- Free-tier scores may be delayed; this is acceptable for current app goals.
- Live minute is not required by the app and is currently set to `null` in provider mode.

## Operational notes
1. Validate season coverage for your target year (2026 later, 2022 for back-testing now).
2. Expand team mappings to all required World Cup teams when provider naming differs.
3. Optionally add retry/backoff for rate limits.
4. Refresh Data commits provider-updated normalized data when it changes.
