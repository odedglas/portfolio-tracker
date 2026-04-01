---
name: visual-validate
description: Scope-aware visual validation of the portfolio-tracker app after code changes. Navigates affected pages, screenshots, analyzes, self-heals, and reports.
---

# Visual Validate

Run after any code change to visually validate that the affected pages look and behave correctly.

## Trigger

- After any code change: `/visual-validate` (auto-infers scope from modified files)
- Specific page: `/visual-validate /dashboard`
- Full sweep: `/visual-validate --all`

## Prerequisites

1. Dev server must be running at `http://localhost:9200`
   - If not reachable, tell the user: "Please run `npm run dev` from the project root, then re-invoke"
   - Do not proceed until reachable
2. Must be logged in as `oded@claw.com` / `Aa123456`

## Step 1: Scope Resolution

Determine which pages to validate:

**If called with a specific route** (e.g. `/visual-validate /dashboard`): validate that page only.

**If called with `--all`**: validate all known routes in order (see route table in `docs/app-context.md` and `CLAUDE.md`).

**If called after a change (default)**: infer affected pages from recently modified files using this mapping:
- `src/stores/portfolios.ts`, `src/components/dashboard/**` → `/dashboard`
- `src/stores/holdings.ts`, `src/components/holdings/**` → `/holdings`
- `src/stores/transactions.ts`, `src/components/transactions/**` → `/transactions`
- `src/stores/quotes.ts` → `/dashboard`, `/holdings`
- `shared/transformers/**` → `/dashboard`, `/holdings`, `/transactions`
- `src/components/common/**` → all pages
- Unknown files → validate `/dashboard` as a baseline

Update this mapping in `docs/app-context.md` as you discover new file→page relationships.

## Step 2: Auth Check

Run:
```
axcli chrome tabs
```

Look for a tab at `localhost:9200`. If none:
```
axcli chrome open "http://localhost:9200/login"
```

Then snapshot the tab and check for a login form. If present, log in:
```
axcli chrome snapshot <tabId>
# Find email/password fields and sign-in button in the snapshot
axcli chrome click <tabId> <email-field-ref>
# Enter: oded@claw.com
axcli chrome click <tabId> <password-field-ref>
# Enter: Aa123456
axcli chrome click <tabId> <signin-button-ref>
```

If already on a dashboard page (not `/login`), auth is active — skip login.

## Step 3: Validate Each Page in Scope

For each page in scope, run this sequence:

### 3a. Navigate
```
axcli chrome navigate <tabId> "http://localhost:9200<route>"
```

### 3b. Screenshot
```
axcli chrome screenshot <tabId>
# Read the resulting file path to view the image
```

### 3c. Analyze
Look for:
- Broken layout (elements overflowing, misaligned, invisible)
- Missing data where data is expected (empty KPI cards, blank charts)
- Error indicators visible in the snapshot
- Loading states stuck indefinitely

### 3d. Simulate user flows

Perform realistic interactions — don't just look at the static page:

| Page | Flow to simulate |
|---|---|
| `/dashboard` | Switch portfolio (if switcher visible), expand profit tooltip |
| `/holdings` | Click a holding row to see details |
| `/transactions` | Open add-transaction drawer |
| `/manage-portfolios` | Verify portfolio list loads |
| `/cash` | Verify deposits list loads |
| `/analytics` | Verify charts render |
| `/stock-plans` | Verify plans list loads |
| `/allocation-planner` | Verify allocation targets render |
| `/balance-history` | Verify balance chart renders |

After each interaction, take another screenshot.

Update `docs/app-context.md` → "Known User Flows" with any flows you discover or confirm.

### 3e. Self-heal

If you spot a visual issue:
- **Obvious/minor** (wrong color, misaligned element, missing CSS class, broken import): fix it automatically, re-screenshot to confirm, note what was fixed in the report
- **Requires judgment** (data logic wrong, architectural change needed, unclear root cause): describe what you see and ask the user: "I see [X] on [page]. Shall I investigate and fix it?"

## Step 4: Update `docs/app-context.md`

After validation, append any new discoveries:
- New components found on pages
- New user flows confirmed
- New file→page mappings discovered
- Any edge cases or known issues

Update the `## Last Updated` line with today's date (format: YYYY-MM-DD).

Commit the update:
```bash
git add docs/app-context.md
git commit -m "docs: update app-context from visual-validate run [date]"
```

## Step 5: Report

Generate a markdown report and share it using the `share-markdown` skill:

```markdown
# Visual Validation Report — [date]

## Scope
Pages validated: [list]
Triggered by: [change description or "manual"]

## Results

### /dashboard
- Status: ✅ Pass / ⚠️ Issues found / 🔧 Auto-fixed
- Observations: [what was seen in screenshots]
- Flows tested: [list]
- Notes: [anything notable]

[repeat per page validated]

## Auto-fixes Applied
[list any code changes made, or "None"]

## Issues Requiring Review
[list anything that needs user decision, or "None"]

## Context Updates
[list what was added to docs/app-context.md, or "None"]
```

To share the report, use the share-markdown skill:
```bash
CONTENT="[report markdown here]"
rtk proxy curl -s -X POST https://md-secure-viewer.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  --data-raw "{\"content\": $(echo "$CONTENT" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))'), \"emails\": \"odedgo@monday.com\", \"owner\": \"claude\"}"
```

Post the returned `url` in chat.

## Completion

Report back with:
- DONE — skill created and committed
- BLOCKED — explain what's wrong
