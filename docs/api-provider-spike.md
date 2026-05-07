# API Provider Spike (No production integration yet)

This spike is intentionally isolated from app runtime. The production app still uses the mock pipeline.

## Candidates compared (high-level)
- **BALLDONTLIE World Cup API**: focused World Cup dataset and purpose-built tournament coverage.
- **football-data.org**: mature football API with documented match/competition resources.
- **TheSportsDB**: broad/free sports API with optional premium tier and different v1/v2 capabilities.
- **API-Football / API-Sports**: deep football coverage (fixtures, standings, events, statuses).

## Why first spike candidate: API-Football / API-Sports
Based on docs surface + practical field coverage for live fixtures and statuses, API-Football/API-Sports is the simplest first candidate to validate against our normalized schema.

## How to run isolated spike scripts
- Mock-only (default, safe, no keys needed):
  - `npm run spike:provider -- footballData`
  - `npm run spike:provider -- apiSports`
- Optional future live placeholder mode (not implemented for real calls yet):
  - `npm run spike:provider -- apiSports --live`

The script writes normalized output to: `src/data/spikes/<provider>-normalized-sample.json`.

## Secrets safety
- Keep keys in local `.env` only.
- Never commit real keys.
- For CI, use GitHub Actions secrets and inject as environment variables.

## Manual validation still required before full integration
1. Verify competition/season coverage for FIFA World Cup 2026.
2. Verify exact live status values mapping (`upcoming/live/final/postponed/canceled`).
3. Verify minute granularity and update cadence during live matches.
4. Verify teams/aliases map reliably to internal team IDs.
5. Verify pricing/rate limits and ToS fit scheduled refresh frequency.


## football-data.org field discovery
- Run: `npm run discover:football-data`
- Guide: `docs/football-data-field-discovery.md`
