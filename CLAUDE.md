# Portfolio Tracker — Project Context

## Stack
- **Frontend:** Quasar 2 / Vue 3, TypeScript, Pinia stores
- **Backend:** Firebase (Firestore, Auth, Cloud Functions)
- **Build:** Vite via `@quasar/app-vite`, PWA mode
- **Node:** 22 (see `.nvmrc`)

## Dev Server

```bash
npm run dev   # from project root
```

Access at `http://localhost:9200`

## Credentials (local dev)
- **URL:** `http://localhost:9200/login`
- **Email:** `oded@claw.com`
- **Password:** `Aa123456`
- **Strategy:** user/password (Firebase Auth)

## Known Routes

| Page | Route |
|---|---|
| Dashboard | `/dashboard` |
| Holdings | `/holdings` |
| Transactions | `/transactions` |
| Manage Portfolios | `/manage-portfolios` |
| Cash Flow | `/cash` |
| Analytics | `/analytics` |
| Stock Plans | `/stock-plans` |
| Allocation Planner | `/allocation-planner` |
| Balance History | `/balance-history` |

Routes are defined in `src/router/routes.ts`.

## Key References
- `@docs/CALCULATIONS.md` — canonical financial calculation logic (avgPrice, invested, profit, FIFO allocation, KPIs). Read before touching any calculation code.
- `@docs/app-context.md` — living app knowledge: discovered components, user flows, edge cases. Updated automatically by the `visual-validate` skill.

## Directives

### After every code change
Run the `visual-validate` skill on pages/flows affected by the change. The skill infers scope from modified files.

Invoke with:
```
/visual-validate
```

Or for a specific page:
```
/visual-validate /dashboard
```

Or for full sweep:
```
/visual-validate --all
```

### Every session (start or end)
Check: did anything change that should be reflected in CLAUDE.md, `docs/app-context.md`, or any skill? If yes, update before closing the session. This keeps the ecosystem self-learning and current.

### Sharing markdown with the user
Never write local `.md` files to share content. Use the `share-markdown` skill instead. It posts a secure browser link to the user.
