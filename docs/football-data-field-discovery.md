# football-data.org Field Discovery (Isolated Spike)

This script inspects the football-data.org API response shape without changing production app behavior.

## Command

```bash
npm run discover:football-data
```

## Required environment variable

- `FOOTBALL_DATA_API_KEY` (required)
- `FOOTBALL_DATA_BASE_URL` (optional, defaults to `https://api.football-data.org/v4`)

> Keep secrets in local `.env` only. Do not commit real keys.


## Run locally

The dedicated GitHub Actions discovery workflow has been removed to keep production workflows focused. Run `npm run discover:football-data` locally with `FOOTBALL_DATA_API_KEY` in your environment when field discovery is needed.

## Endpoints checked

1. `GET /competitions`
2. `GET /competitions/WC`
3. `GET /competitions/WC/matches?limit=10`
4. `GET /competitions/PL/matches?limit=10` (fallback if World Cup sample is unavailable/restricted)

## What the report tells you

For each endpoint:
- request success/failure
- tested endpoint path
- HTTP status code
- top-level response fields

For match endpoints, it also checks availability of:
- match id
- competition id/name/code
- season/year fields
- kickoff time (`utcDate`)
- status
- matchday
- stage/group/round
- home team id/name
- away team id/name
- full-time home/away goals
- winner
- live-minute signal (if any)
- `lastUpdated` timestamp

It then summarizes:
- whether completed matches include score totals
- whether sample data appears sufficient for cumulative team-goal scoring
- likely gaps that require inference or can be treated as optional

## Required vs optional fields for this app

### Required (for scoring + match feed)
- match id
- kickoff timestamp (`utcDate`)
- status
- home/away team identifiers and names
- full-time home and away goals for finished matches

### Helpful but optional
- competition id/name/code
- season metadata
- matchday
- stage/group/round
- winner
- lastUpdated
- live minute

### Generally inferred later
- team elimination/champion status (often inferred from knockout progression and final results)

## What remains unknown until real-key execution

- free-tier freshness (live vs delayed cadence)
- whether World Cup endpoints are fully accessible on the current plan
- endpoint-specific quota behavior under scheduled polling
