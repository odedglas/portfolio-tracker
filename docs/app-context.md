# Portfolio Tracker — Living App Context

> This file is auto-updated by the `visual-validate` skill. Do not edit manually unless correcting an error. Append new discoveries; do not overwrite existing entries.

## Last Updated

2026-04-03

## Known Routes

| Page               | Route                 | Notes                             |
| ------------------ | --------------------- | --------------------------------- |
| Dashboard          | `/dashboard`          | Main KPI view, portfolio switcher |
| Holdings           | `/holdings`           | Active positions list             |
| Transactions       | `/transactions`       | Buy/sell transaction history      |
| Manage Portfolios  | `/manage-portfolios`  | Create/edit portfolios            |
| Cash Flow          | `/cash`               | Cash in/out tracking              |
| Analytics          | `/analytics`          | Charts and performance analysis   |
| Stock Plans        | `/stock-plans`        | Planned future positions          |
| Allocation Planner | `/allocation-planner` | Portfolio allocation targets      |
| Balance History    | `/balance-history`    | Historical balance snapshots      |

## Navigation Structure

The app uses a **top navbar** (not a sidebar) with 4 nav items:

- Dashboard, Portfolio, Analytics, Stocks Plans

There is also a **bottom-right FAB** (`+` button) for adding entries, and a **side drawer** accessible via icon links (account_balance, transform, attach_money, content_paste) — likely Holdings, Transactions, Cash, Plans.

## Known User Flows

### Dashboard (no portfolios state)

- Shows "No Portfolios" in header with portfolio switcher dropdown
- Holdings allocation card: empty (no data without a portfolio)
- Portfolio heat map card: empty (no data without a portfolio)
- Daily Movers section: renders benchmarks (S&P, Nasdaq, Russel, Dow Jones, USD/ILS, VIX, Oil, Gold, Silver) with live prices and % changes
- Fear and Greed Index displays in Daily Movers header

### Auth flow

- `/login` page: Email + Password fields + LOGIN button + Google/Facebook/Twitter social login buttons
- Successful auth redirects to `/dashboard`
- Session persists across page navigations

## Discovered Components

- `LoadingLayout.vue` — renderless component (no template), uses Quasar `$q.loading` overlay to show/hide a spinner. Triggers a Vue "missing template" warning in console — this is a known false positive, not a bug.
- Top navbar with route links: Dashboard, Portfolio, Analytics, Stocks Plans
- Portfolio switcher dropdown in top-right
- Holdings allocation card (pie chart, empty without portfolio)
- Portfolio heat map card (empty without portfolio)
- Daily Movers section with benchmark ticker cards
- Fear and Greed Index badge
- FAB (+) button bottom-right for adding entries

## File → Page Mappings

| Files                                                          | Affected Pages                             |
| -------------------------------------------------------------- | ------------------------------------------ |
| `src/stores/portfolios.ts`, `src/components/dashboard/**`      | `/dashboard`                               |
| `src/stores/holdings.ts`, `src/components/holdings/**`         | `/holdings`                                |
| `src/stores/transactions.ts`, `src/components/transactions/**` | `/transactions`                            |
| `src/stores/quotes.ts`                                         | `/dashboard`, `/holdings`                  |
| `shared/transformers/**`                                       | `/dashboard`, `/holdings`, `/transactions` |
| `src/components/common/**`                                     | all pages                                  |
| `src/layouts/LoadingLayout.vue`                                | all pages (global overlay)                 |

## Portfolio Target Feature (PR #67)

- `PortfolioTarget.vue` — milestone strip component rendered on `/dashboard` between KPI cards and Holdings allocation card
- Visible only when `portfolio.target > 0`; hidden entirely when no target is set
- Shows: "Goal: $X" header, filled progress bar, 4 milestone dots at 25/50/75/100%, current position dot, "$X · Y%" label
- "Target reached!" state (trophy icon) when `percentage >= 1`
- Progress value = `(currentValue + cashFlow) / target` — cash-flow-adjusted, not raw market value
- Milestone labels use abbreviated format: `$13k`, `$25k`, `$38k`, `$50k` for a $50k target
- Creating a portfolio via the portfolio switcher dropdown → "+ Create" opens the New Portfolio dialog which includes the Target field

### File → Page Mapping (new)

| Files | Affected Pages |
|---|---|
| `src/components/dashboard/PortfolioTarget.vue` | `/dashboard` |
| `src/components/composables/usePortfolioKpis.ts` | `/dashboard` |

## Known Issues / Edge Cases

- `LoadingLayout.vue` has no `<template>` block — Vue warns "Component is missing template or render function" in the console. This is intentional; the component is renderless and uses Quasar's loading plugin. Not a bug.
- ~~Login toast on successful auth~~ — **FIXED in PR #66**. Root cause: `createAppUser` used `addDoc` (random doc ID) instead of `setDoc` at `users/{uid}`, failing Firestore security rules. Fix: pass `user.uid` to `api.update`.

## Auth Architecture

- **Login flow:** `LoginForm.vue` → `authentication.signInWithPassword` → `authenticationWithLoading` → `emitLoadingTask` → Firebase `signInWithEmailAndPassword` + `createAppUser`
- **Social login flow:** `SocialMediaLoginBar.vue` → `authentication.signInWithProvider` → same `authenticationWithLoading` path
- **`createAppUser`** (`src/service/user.ts`): checks if user doc exists at `users/{uid}` first; skips creation if found; creates via `api.update(data, user.uid)` — the `userId` argument is required to use `setDoc` at the correct path
- **`emitLoadingTask`** (`src/stores/loading.ts`): runs `Promise.all([task(), wait(1000)])` — any throw inside propagates to the caller
- **Firestore security rules:** user docs must be written to `users/{uid}` where `uid == request.auth.uid` — `addDoc` with auto-generated IDs will always be rejected
- **Sign out:** `authentication.signOut()` → Firebase `signOut(auth)`

## File → Auth Mappings

| File                                           | Role                                                                                         |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `src/components/login/LoginForm.vue`           | Email/password login + signup form                                                           |
| `src/components/login/SocialMediaLoginBar.vue` | Google/Facebook/Twitter login buttons                                                        |
| `src/service/firebase/authentication.ts`       | `authenticationWithLoading`, `signInWithPassword`, `signInWithProvider`, `signUp`, `signOut` |
| `src/service/user.ts`                          | `createAppUser` — idempotent user doc creation                                               |
| `src/stores/loading.ts`                        | `emitLoadingTask` — wraps async tasks with loading spinner                                   |
