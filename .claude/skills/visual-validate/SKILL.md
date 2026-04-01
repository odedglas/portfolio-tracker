---
name: visual-validate
description: Scope-aware visual validation of the portfolio-tracker app after code changes. Navigates affected pages, screenshots, analyzes, and self-heals. Agent-internal — no external reporting.
---

# Visual Validate

Run after any code change to visually validate that the affected pages look and behave correctly. This skill is for the agent to validate itself — results stay in-session and in `docs/app-context.md`, not shared externally.

## Trigger

- After any code change: `/visual-validate` (auto-infers scope from modified files)
- Specific page: `/visual-validate /dashboard`
- Full sweep: `/visual-validate --all`

## Prerequisites

1. Dev server must be running at `http://localhost:9200`
   - If not reachable, tell the user: "Please run `npm run dev` from the project root, then re-invoke"
   - Do not proceed until reachable
2. Must be logged in — check by looking for a tab already past `/login`

## Step 1: Scope Resolution

Determine which pages to validate:

**If called with a specific route** (e.g. `/visual-validate /dashboard`): validate that page only.

**If called with `--all`**: validate all known routes in order (see route table in `docs/app-context.md` and `CLAUDE.md`).

**If called after a change (default)**: infer affected pages from recently modified files using this mapping:

| Files | Affected Pages |
|---|---|
| `src/stores/portfolios.ts`, `src/components/dashboard/**` | `/dashboard` |
| `src/stores/holdings.ts`, `src/components/holdings/**` | `/holdings` |
| `src/stores/transactions.ts`, `src/components/transactions/**` | `/transactions` |
| `src/stores/quotes.ts` | `/dashboard`, `/holdings` |
| `shared/transformers/**` | `/dashboard`, `/holdings`, `/transactions` |
| `src/components/common/**` | all pages |
| `src/layouts/LoadingLayout.vue` | all pages |
| Unknown files | `/dashboard` (baseline) |

Update this mapping in `docs/app-context.md` as you discover new file→page relationships.

## Step 2: Auth Check

```bash
axcli chrome tabs
```

Look for a tab at `localhost:9200` that is NOT on `/login`. If one exists, use it — auth is active.

If no tab exists at `localhost:9200`:
```bash
axcli chrome open "http://localhost:9200/login"
# Note the new tabId from the response
```

If the tab is on `/login`, log in:
```bash
axcli chrome snapshot <tabId>
# Snapshot returns refs. Expect: @1 = Email field, @2 = Password field, @3 = LOGIN button
axcli chrome type <tabId> @1 "oded@claw.com"
axcli chrome type <tabId> @2 "Aa123456"
axcli chrome click <tabId> @3
axcli chrome wait <tabId> load --timeout 5000
```

**Known bug:** A "Wrong email or password" toast appears even on successful login — ignore it. Auth succeeds if the app navigates away from `/login`.

## Step 3: Validate Each Page in Scope

For each page, run this sequence:

### 3a. Navigate
```bash
axcli chrome navigate <tabId> "http://localhost:9200<route>"
# Wait a moment for the page to settle
```

### 3b. Screenshot + analyze
```bash
axcli chrome screenshot <tabId>
# Read the returned file path to view the image
```

Look for:
- Broken layout (overflowing, misaligned, invisible elements)
- Missing data where data is expected (empty KPI cards, blank charts)
- Loading spinners stuck indefinitely

**Known false positive:** `LoadingLayout.vue` triggers a Vue "missing template" warning in the console — ignore it, it's intentional.

### 3c. Snapshot for interactions
```bash
axcli chrome snapshot <tabId>
# Use refs from snapshot to click interactive elements
```

### 3d. Simulate user flows

Interact realistically per page — always snapshot first to get current refs:

| Page | Flow to simulate |
|---|---|
| `/dashboard` | Click portfolio switcher dropdown (`Expand "No Portfolios"` or similar) |
| `/holdings` | Click a holding row if any exist |
| `/transactions` | Click the FAB `+` button to open add-transaction drawer |
| `/manage-portfolios` | Verify portfolio list loads |
| `/cash` | Verify deposits list loads |
| `/analytics` | Verify charts render |
| `/stock-plans` | Verify plans list loads |
| `/allocation-planner` | Verify allocation targets render |
| `/balance-history` | Verify balance chart renders |

After each interaction, take another screenshot.

### 3e. Self-heal

If you spot a visual issue:
- **Obvious/minor** (wrong color, misaligned element, missing CSS class, broken import): fix it automatically, re-screenshot to confirm
- **Requires judgment** (data logic wrong, architectural change needed, unclear root cause): ask the user: "I see [X] on [page]. Shall I investigate and fix it?"

## Step 4: Update `docs/app-context.md`

Append any new discoveries after validation:
- New components or UI patterns found
- New user flows confirmed
- New file→page mappings
- New edge cases or known issues

Update the `## Last Updated` line with today's date (YYYY-MM-DD), then commit:

```bash
git add docs/app-context.md
git commit -m "docs: update app-context from visual-validate run $(date +%Y-%m-%d)"
```

## Step 5: In-session Summary

Report findings inline in chat — no external sharing needed. Format:

```
Visual validation complete.

Pages checked: [list]
✅ Pass: [list]
⚠️ Issues found: [describe]
🔧 Auto-fixed: [describe or "None"]
❓ Needs your input: [describe or "None"]
Context updates: [what was added to app-context.md or "None"]
```
