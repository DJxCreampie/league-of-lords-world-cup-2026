# Manager/Team Assignment Workflow

## Source of truth files
- Managers: `src/data/assignments/managers.json`
- Official assignments: `src/data/assignments/official-assignments.json`
- Generated draft assignments: `data/assignment-drafts/generated-assignment-draft.json`

## Assignment rules
- 10 managers
- 4 teams per manager
- 40 assigned teams total
- 8 unassigned teams total (48 World Cup teams - 40 assigned)

## Validate official assignments
Run:

```bash
npm run validate:assignments
```

Validation checks:
- each manager has exactly 4 teams
- no duplicate team assignments
- every assigned team exists in mapped generated 2026 team list
- exactly 40 assigned teams
- exactly 8 unassigned teams
- invalid manager/team IDs are reported clearly

## Generate random assignment draft
Run:

```bash
npm run generate:assignments
```

Behavior:
- reads teams from `src/data/normalized/generated-data.json`
- ignores `unmapped:*` and `Unknown Home/Away` placeholders
- randomly selects 40 of 48 mapped teams
- assigns 4 teams to each manager
- leaves 8 teams unassigned
- writes draft output only (safe): `data/assignment-drafts/generated-assignment-draft.json`

## Promote draft to official
1. Generate draft.
2. Review team distribution + fairness manually.
3. Copy reviewed draft `assignments` into `src/data/assignments/official-assignments.json`.
4. Re-run `npm run validate:assignments` before committing.

## Scoring connection
Leaderboard scoring uses manager/team assignments. Keeping official assignments valid ensures manager totals are calculated consistently from assigned teams and team goals.
