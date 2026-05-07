# Future Real API Provider Setup (Mock-first Today)

## Current mock pipeline
- Mock provider payloads live in `src/data/mock-api/`.
- `scripts/update-data.mjs` reads mock payloads and mapping data, then writes normalized output to `src/data/normalized/generated-data.json`.
- `npm run update:data` is used by the refresh workflow to regenerate normalized data before build.

## Where real API integration will go
- Keep the app reading internal normalized data.
- Replace mock file reads in `scripts/update-data.mjs` with provider fetch calls.
- Keep/extend adapter normalization in `src/lib/apiAdapter.ts`.
- Continue using `src/data/mappings/teamMapping.ts` for provider ID/name alias resolution.

## Environment variables (placeholders)
See `.env.example`:
- `VITE_DATA_MODE` (mock or api)
- `VITE_API_PROVIDER`
- `VITE_API_BASE_URL`
- `VITE_API_KEY`
- `VITE_API_COMPETITION_ID`
- `VITE_API_SEASON`

## Secrets and key safety
- Never commit real keys to git.
- Keep local keys in `.env` (git-ignored).
- For GitHub Actions, store keys in **Settings → Secrets and variables → Actions**.
- Reference secrets in workflow jobs as `${{ secrets.YOUR_SECRET_NAME }}`.

## Provider data fields needed by this app
The app needs these normalized fields:
- Match: `matchId`, `competitionId`, `kickoffTime`, `status`, `minute`, teams, goals, optional winner.
- Team status: `teamId`, `teamName`, `apiTeamId`, `group`, `goalsFor`, `status`, `matchesPlayed`, `lastUpdated`.

## Team mapping guidance
- Provider names can vary (e.g., "United States" vs "USA" vs "USMNT").
- Update mapping tables when adding a provider or when provider naming changes.
- Missing mappings should fail loudly so data issues are caught early.

## What remains before real API connection
1. Add provider fetch client in `scripts/update-data.mjs` (or a shared fetch module).
2. Pass API credentials via local `.env` and Actions secrets.
3. Expand adapter status mapping and edge-case validation for chosen provider.
4. Add retry/backoff and rate-limit handling in scheduled refresh workflow.
5. Add tests for provider payload fixtures + mapping coverage.
