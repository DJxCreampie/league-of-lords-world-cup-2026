# API Provider Setup (Mock Default + Optional football-data Mode)

## Current default behavior
- `npm run update:data` still defaults to `DATA_SOURCE=mock`.
- Scheduled refresh workflow still runs mock mode by default.
- Production app behavior remains unchanged and continues consuming normalized data output.

## football-data.org provider mode (opt-in)
The update script can now fetch and normalize football-data.org matches when explicitly enabled.

### Required environment variables for provider mode
- `FOOTBALL_DATA_API_KEY` (required)
- `FOOTBALL_DATA_BASE_URL` (optional, default `https://api.football-data.org/v4`)
- `FOOTBALL_DATA_COMPETITION_CODE` (optional, default `WC`)
- `FOOTBALL_DATA_SEASON_YEAR` (optional, default `2026`; use `2022` for historical validation)

### Run commands
- Mock/default mode:
  - `npm run update:data`
- football-data mode:
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
Use **Actions → Refresh Data → Run workflow** and select:
- `source_mode=football-data`
- optional `competition_code` and `season_year`

`FOOTBALL_DATA_API_KEY` must be configured in repository secrets.

## Delayed scores + live minute
- Free-tier scores may be delayed; this is acceptable for current app goals.
- Live minute is not required by the app and is currently set to `null` in provider mode.

## Before making football-data the default source
1. Validate season coverage for your target year (2026 later, 2022 for back-testing now).
2. Expand team mappings to all required World Cup teams.
3. Optionally add retry/backoff for rate limits.
4. Decide schedule/commit policy for provider-updated data.
