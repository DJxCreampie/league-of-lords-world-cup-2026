# API Adapter Layer (Mock-first)

This folder isolates provider-specific payloads from the rest of the app.

## Current flow
1. Provider payloads (currently mock JSON files in `src/data/mock-api/`) are parsed by adapter functions.
2. Adapters return normalized internal models:
   - `NormalizedMatch`
   - `NormalizedTeamStatus`
3. Scoring/UI should consume normalized/internal data, not provider shapes.

## Plugging in a real provider later
- Replace mock JSON loads with real fetch calls.
- Keep `normalizeMatchResponse` and `normalizeTeamStandingsResponse` as translation points.
- Update `teamMapping.ts` as provider IDs/names change.
- If a new provider has different status codes, only update `normalizeStatus`.

Guardrails are intentionally strict: unknown team mapping and malformed payloads throw explicit errors.
