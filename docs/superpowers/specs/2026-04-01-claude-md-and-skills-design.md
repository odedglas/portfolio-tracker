# Design: CLAUDE.md + Visual Validate + Share Markdown Skills

**Date:** 2026-04-01  
**Status:** Approved

---

## Overview

Three artifacts that form a self-learning, self-validating development ecosystem for the portfolio-tracker project:

1. **`CLAUDE.md`** (project root) — project context, stack, credentials, directives
2. **`visual-validate` skill** (project-scoped) — scope-aware visual validation loop with self-healing and reporting
3. **`share-markdown` skill** (global) — reusable markdown sharing via md-secure-viewer.vercel.app

---

## 1. CLAUDE.md

### Contents

- **Stack**: Quasar/Vue 3, Pinia, Firebase, PWA, TypeScript, Node 22 (`.nvmrc`)
- **Dev server**: `npm run dev` from root → `localhost:9200`
- **Credentials**: login `oded@claw.com` / `Aa123456` (user/password strategy)
- **Known routes**: Dashboard, Holdings, Transactions, AllocationPlanner, Analytics, Balance, CashFlow, StockPlans, ManagePortfolios
- **References**:
  - `@docs/CALCULATIONS.md` — canonical financial calculation logic
  - `@docs/app-context.md` — living app knowledge, auto-updated by visual-validate
- **Directives**:
  - After applying any change, run the `visual-validate` skill on affected pages
  - At the start/end of every session, check if any skills, context files, or CLAUDE.md itself need updating based on what was learned or changed

### Self-learning rule

Every session must end with a check: did anything change that should be reflected in CLAUDE.md, `docs/app-context.md`, or any skill? If yes, update it before closing.

---

## 2. `visual-validate` Skill (project-scoped)

### Trigger

- Invoked by CLAUDE.md directive after any code change
- Can be called explicitly: `/visual-validate [page/flow]` or `/visual-validate --all`

### Loop

1. **Reachability check** — ping `localhost:9200`; if unreachable, remind user to run `npm run dev` and wait
2. **Auth** — navigate to `/login`, log in with `oded@claw.com` / `Aa123456` if session not active
3. **Scope resolution**:
   - Called after a change → infer affected pages/flows from modified files
   - Called with explicit target → go there directly
   - Called with `--all` → iterate all known routes
4. **Per-page validation**:
   - Screenshot the page
   - Snapshot interactive elements
   - Analyze: broken layout, missing data, misaligned components, console errors
5. **User flow simulation** — interact realistically (e.g. add transaction, switch portfolio, open drawer) not just static screenshots
6. **Self-heal**:
   - Fix obvious visual/logic issues automatically → re-screenshot to confirm
   - Ask before anything requiring architectural judgment
7. **Update `docs/app-context.md`** — append any newly discovered pages, components, behaviors, or edge cases
8. **Report** — generate a markdown report (screenshot observations + pass/fail per area) and share via `share-markdown` skill

### Known routes (seed list — grows via app-context.md)

| Page               | Route                 |
| ------------------ | --------------------- |
| Dashboard          | `/dashboard`          |
| Holdings           | `/holdings`           |
| Transactions       | `/transactions`       |
| Allocation Planner | `/allocation-planner` |
| Analytics          | `/analytics`          |
| Balance            | `/balance`            |
| Cash Flow          | `/cash-flow`          |
| Stock Plans        | `/stock-plans`        |
| Manage Portfolios  | `/manage-portfolios`  |

---

## 3. `share-markdown` Skill (global)

### Purpose

Replace writing local `.md` files with sharing a secure, browser-viewable link. Available in all projects/sessions.

### When to use

Any time Claude would otherwise write a local file to share content with the user: specs, reports, design docs, summaries, validation results.

### Invocation pattern

```bash
rtk proxy curl -s -X POST https://md-secure-viewer.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  --data-raw '{"content":"# Your markdown here","emails":"odedgo@monday.com","owner":"claude"}'
```

### Rules

- Always use `rtk proxy curl` (not plain `curl`) — RTK filters raw JSON and hides the URL
- Always set `emails` to `odedgo@monday.com` — this is the browser-authenticated email
- Post the returned `url` in chat for the user to open

---

## File Structure

```
portfolio-tracker/
├── CLAUDE.md                          ← project context + directives
├── docs/
│   ├── CALCULATIONS.md                ← existing, referenced by CLAUDE.md
│   ├── app-context.md                 ← living knowledge, auto-updated by skill
│   └── superpowers/specs/
│       └── 2026-04-01-claude-md-and-skills-design.md  ← this file

~/.claude/
├── CLAUDE.md                          ← global user instructions (existing)
└── skills/
    └── share-markdown.md              ← global skill (new)

~/.claude/plugins/.../skills/
└── visual-validate/                   ← project-scoped skill (new)
    └── SKILL.md
```

---

## Success Criteria

- Claude never writes local `.md` files to share content — always uses the secure viewer
- After every code change, affected pages are visually validated before the session closes
- `docs/app-context.md` grows over time with discovered routes, components, and behaviors
- CLAUDE.md and skills stay up to date — no stale context across sessions
