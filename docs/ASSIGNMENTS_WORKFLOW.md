# Manager/Team Assignment Workflow

## Final source of truth
- Managers: `src/data/assignments/managers.json`
- Final official assignments: `src/data/assignments/official-assignments.json`

> Final assignments are entered manually and should not change after lock-in.

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
- 8 unassigned teams total

## Full team pool policy
- The full 48-team pool is derived from `src/data/normalized/generated-data.json`.
- `football-data.org` match data is the production provider data source.
- Old assignable-team draft files and draft-generation flows have been removed from production.

## Validate official assignments
Run:

```bash
npm run validate:assignments
```

Validation checks that:
- every manager in `managers.json` has one assignment entry,
- every manager has exactly 4 teams,
- no team is assigned twice,
- all assigned teams exist in the generated production team pool.

## GitHub Actions validation
Use **Validate Assignments** when assignment files change. The workflow can optionally refresh football-data before validation.

`FOOTBALL_DATA_API_KEY` must be configured in repository secrets when using football-data refresh mode.

## Leaderboard connection
The app leaderboard reads official assignment data from `src/data/assignments/official-assignments.json` through `src/productionData.ts`. Manager totals are the sum of match-calculated goals for assigned teams only.
