# Manager/Team Assignment Workflow

## Final source of truth (manual)
- Managers: `src/data/assignments/managers.json`
- Final official assignments: `src/data/assignments/official-assignments.json`

> Final assignments are entered manually, one time, and should not change after they are finalized.

## Exact official assignment format
Each object in `official-assignments.json` should use:

```json
{
  "managerId": "manager-1",
  "managerDisplayName": "Avery Stone",
  "teamIds": ["team-a", "team-b", "team-c", "team-d"]
}
```

Rules:
- `teamIds` must contain exactly 4 team IDs.
- `managerDisplayName` should match `managers.json` for readability and audit.
- No team may appear in more than one manager entry.

## Assignment totals required
- 10 managers
- 4 teams per manager
- 40 assigned teams total
- 8 unassigned teams total (48 World Cup teams - 40 assigned)


## Full 48-team pool policy
- Full reference list: `docs/ASSIGNABLE_TEAMS_2026.md`.
- All 48 mapped teams remain available for reference and future assignment changes.
- `src/data/assignments/official-assignments.json` should assign exactly 40 of these teams.
- The remaining 8 teams stay unassigned but still referenceable (not removed from the pool).
- Final 40-team assignment can be edited manually later before lock-in.

## Validate official assignments (required after manual edits)
Run:

```bash
npm run validate:assignments
```

Validation checks:
- exactly 10 managers
- each manager has exactly 4 teams
- no duplicate team assignments
- every assigned team exists in mapped generated 2026 team list
- exactly 40 assigned teams
- exactly 8 real teams unassigned
- knockout placeholders (`Unknown Home` / `Unknown Away`, `unmapped:*`) are ignored
- invalid manager/team IDs are reported clearly

## Optional utility: random assignment draft
`Generate Assignment Draft` is optional only; it is **not** the primary workflow for final league assignments.

Run:

```bash
npm run generate:assignments
```

Draft behavior:
- reads teams from `src/data/normalized/generated-data.json`
- excludes placeholder/unmapped teams
- writes draft output only to `data/assignment-drafts/generated-assignment-draft.json`
- does not overwrite official assignments

## Run from GitHub Actions (manual)

### Validate assignments
1. Open **Actions → Validate Assignments → Run workflow**.
2. Choose `refresh_source`:
   - `football-data` (recommended)
   - `mock`
   - `none`
3. Workflow runs `npm run validate:assignments` against `src/data/assignments/official-assignments.json`.

### Generate assignment draft (optional)
1. Open **Actions → Generate Assignment Draft → Run workflow**.
2. Choose `refresh_source` (`football-data` recommended).
3. Workflow runs `npm run generate:assignments`.
4. If changed, it commits only `data/assignment-drafts/generated-assignment-draft.json`.

`FOOTBALL_DATA_API_KEY` must be configured in repository secrets when using `football-data` refresh mode.

## Leaderboard connection
The app leaderboard currently reads assignment data from `src/data/assignments/official-assignments.json` via `src/productionData.ts`, so manual official assignments are the scoring source-of-truth.
