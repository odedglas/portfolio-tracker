# Portfolio Tracker — Living App Context

> This file is auto-updated by the `visual-validate` skill. Do not edit manually unless correcting an error. Append new discoveries; do not overwrite existing entries.

## Last Updated

2026-04-01

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

| Files | Affected Pages |
|---|---|
| `src/stores/portfolios.ts`, `src/components/dashboard/**` | `/dashboard` |
| `src/stores/holdings.ts`, `src/components/holdings/**` | `/holdings` |
| `src/stores/transactions.ts`, `src/components/transactions/**` | `/transactions` |
| `src/stores/quotes.ts` | `/dashboard`, `/holdings` |
| `shared/transformers/**` | `/dashboard`, `/holdings`, `/transactions` |
| `src/components/common/**` | all pages |
| `src/layouts/LoadingLayout.vue` | all pages (global overlay) |

## Known Issues / Edge Cases

- `LoadingLayout.vue` has no `<template>` block — Vue warns "Component is missing template or render function" in the console. This is intentional; the component is renderless and uses Quasar's loading plugin. Not a bug.
- The `oded@claw.com` / `Aa123456` credentials produce a "Wrong email or password" toast on login attempt, BUT the app still navigates to dashboard via an existing Firebase session. The test account session persists — login via credentials may not be needed if session is active.
