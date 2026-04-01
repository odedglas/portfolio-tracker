# CLAUDE.md + Visual Validate + Share Markdown Skills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a self-learning, self-validating development ecosystem for portfolio-tracker: a project CLAUDE.md with full context + directives, a repo-scoped visual-validate skill, a living app-context doc, and a global share-markdown skill.

**Architecture:** CLAUDE.md at project root references `docs/CALCULATIONS.md` and `docs/app-context.md` (living knowledge). A repo-local skill at `.claude/skills/visual-validate/SKILL.md` handles scope-aware validation, self-healing, and reporting. A global skill at `~/.claude/skills/share-markdown/SKILL.md` provides reusable markdown sharing across all sessions. The visual-validate skill appends discoveries to `docs/app-context.md`, keeping context current across sessions.

**Tech Stack:** Quasar/Vue 3, Pinia, Firebase, PWA, TypeScript, Node 22, axcli chrome automation, md-secure-viewer.vercel.app API, rtk proxy curl

---

## File Map

| File                                       | Action | Purpose                                                 |
| ------------------------------------------ | ------ | ------------------------------------------------------- |
| `CLAUDE.md`                                | Create | Project context, stack, credentials, routes, directives |
| `docs/app-context.md`                      | Create | Living app knowledge, auto-updated by visual-validate   |
| `.claude/skills/visual-validate/SKILL.md`  | Create | Repo-scoped visual validation skill                     |
| `~/.claude/skills/share-markdown/SKILL.md` | Create | Global markdown sharing skill                           |

---

### Task 1: Create `docs/app-context.md` (seed file)

**Files:**

- Create: `docs/app-context.md`

- [ ] **Step 1: Create the seed file**

Create `docs/app-context.md` with this content:

```markdown
# Portfolio Tracker — Living App Context

> This file is auto-updated by the `visual-validate` skill. Do not edit manually unless correcting an error. Append new discoveries; do not overwrite existing entries.

## Last Updated

_Not yet validated_

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

## Known User Flows

_To be populated by visual-validate on first run._

## Discovered Components

_To be populated by visual-validate on first run._

## Known Issues / Edge Cases

_To be populated by visual-validate on first run._
```

- [ ] **Step 2: Commit**

```bash
git add docs/app-context.md
git commit -m "docs: add living app-context seed file"
```

---

### Task 2: Create project `CLAUDE.md`

**Files:**

- Create: `CLAUDE.md`

- [ ] **Step 1: Create CLAUDE.md**

Create `CLAUDE.md` at the project root with this content:

````markdown
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
````

Access at `http://localhost:9200`

## Credentials (local dev)

- **URL:** `http://localhost:9200/login`
- **Email:** `oded@claw.com`
- **Password:** `Aa123456`
- **Strategy:** user/password (Firebase Auth)

## Known Routes

| Page               | Route                 |
| ------------------ | --------------------- |
| Dashboard          | `/dashboard`          |
| Holdings           | `/holdings`           |
| Transactions       | `/transactions`       |
| Manage Portfolios  | `/manage-portfolios`  |
| Cash Flow          | `/cash`               |
| Analytics          | `/analytics`          |
| Stock Plans        | `/stock-plans`        |
| Allocation Planner | `/allocation-planner` |
| Balance History    | `/balance-history`    |

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

````

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add project CLAUDE.md with stack, routes, credentials, and directives"
````

---

### Task 3: Create global `share-markdown` skill

**Files:**

- Create: `~/.claude/skills/share-markdown/SKILL.md`

- [ ] **Step 1: Create the skills directory and skill file**

```bash
mkdir -p ~/.claude/skills/share-markdown
```

Create `~/.claude/skills/share-markdown/SKILL.md`:

````markdown
---
name: share-markdown
description: Share markdown content with the user via a secure browser link instead of writing local files. Use whenever you would otherwise create a .md file to show the user.
---

# Share Markdown

Use this instead of writing local `.md` files whenever sharing content with the user: specs, reports, design docs, summaries, validation results.

## When to Use

Any time you would write a file just to show it to the user. This creates a secure, email-gated browser link instead.

## Invocation

```bash
rtk proxy curl -s -X POST https://md-secure-viewer.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  --data-raw "{\"content\": $(echo "$CONTENT" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))'), \"emails\": \"odedgo@monday.com\", \"owner\": \"claude\"}"
```
````

Where `$CONTENT` is the markdown string (use shell variable or inline).

## Rules

1. **Always use `rtk proxy curl`** — plain `curl` causes RTK to summarize the JSON response and hide the URL
2. **Always set `emails` to `odedgo@monday.com`** — this is the browser-authenticated Google account. Using any other email causes "Access Denied"
3. Extract the `url` field from the JSON response and post it in chat
4. Never open the link yourself — just give the URL to the user

## Full Example

```bash
CONTENT="# My Report\n\nHello world"
rtk proxy curl -s -X POST https://md-secure-viewer.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  --data-raw "{\"content\": $(echo -e "$CONTENT" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))'), \"emails\": \"odedgo@monday.com\", \"owner\": \"claude\"}"
# Returns: {"url":"https://md-secure-viewer.vercel.app/view#...","message":"Successfully generated secure workspace link."}
```

Post the `url` value in chat.

````

- [ ] **Step 2: Verify the file exists**

```bash
cat ~/.claude/skills/share-markdown/SKILL.md
````

Expected: full skill content printed.

- [ ] **Step 3: Test the skill works**

```bash
rtk proxy curl -s -X POST https://md-secure-viewer.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  --data-raw '{"content":"# share-markdown skill test\n\nSkill installed and working.","emails":"odedgo@monday.com","owner":"claude"}'
```

Expected: JSON response with a `url` field. Post that URL to confirm access.

---

### Task 4: Create repo-scoped `visual-validate` skill

**Files:**

- Create: `.claude/skills/visual-validate/SKILL.md`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p /Users/odedgo/Development/portfolio-tracker/.claude/skills/visual-validate
```

- [ ] **Step 2: Create the skill file**

Create `.claude/skills/visual-validate/SKILL.md`:

````markdown
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

```bash
axcli chrome tabs
```

Look for a tab at `localhost:9200`. If none:

```bash
axcli chrome open "http://localhost:9200/login"
```

Then check for a login form. If present, log in:

```bash
axcli chrome click <tabId> "Email"   # or snapshot and find the email field
# type oded@claw.com
axcli chrome click <tabId> "Password"
# type Aa123456
axcli chrome click <tabId> "Sign in"  # or equivalent button text
```

If already on a dashboard page (not `/login`), auth is active — skip login.

## Step 3: Validate Each Page in Scope

For each page, run this sequence:

### 3a. Navigate

```bash
axcli chrome navigate <tabId> "http://localhost:9200<route>"
```

### 3b. Screenshot

```bash
axcli chrome screenshot <tabId>
# Read the resulting file path, then:
# Read <path>  ← view the screenshot
```

### 3c. Analyze

Look for:

- Broken layout (elements overflowing, misaligned, invisible)
- Missing data where data is expected (empty KPI cards, blank charts)
- Console errors (use snapshot to check for error indicators)
- Loading states stuck indefinitely

### 3d. Simulate user flows

Perform realistic interactions — don't just look at the static page. Examples by page:

| Page                  | Flow to simulate                                              |
| --------------------- | ------------------------------------------------------------- |
| `/dashboard`          | Switch portfolio (if switcher visible), expand profit tooltip |
| `/holdings`           | Click a holding row to see details                            |
| `/transactions`       | Open add-transaction drawer                                   |
| `/manage-portfolios`  | Verify portfolio list loads                                   |
| `/cash`               | Verify deposits list loads                                    |
| `/analytics`          | Verify charts render                                          |
| `/stock-plans`        | Verify plans list loads                                       |
| `/allocation-planner` | Verify allocation targets render                              |
| `/balance-history`    | Verify balance chart renders                                  |

After each interaction, take another screenshot.

Update `docs/app-context.md` → "Known User Flows" with any flows you discover or confirm.

### 3e. Self-heal

If you spot a visual issue:

- **Obvious/minor** (wrong color, misaligned element, missing CSS class, broken import): fix it automatically, re-screenshot to confirm, note what was fixed
- **Requires judgment** (data logic wrong, architectural change needed, unclear root cause): describe what you see, ask the user: "I see [X] on [page]. Shall I investigate and fix it?"

## Step 4: Update `docs/app-context.md`

After validation, append any new discoveries:

- New components found on pages
- New user flows confirmed
- New file→page mappings discovered
- Any edge cases or known issues

Update the `## Last Updated` line with today's date.

## Step 5: Report

Generate a markdown report and share it using the `share-markdown` skill:

```markdown
# Visual Validation Report — <date>

## Scope

Pages validated: [list]
Triggered by: [change description or "manual"]

## Results

### /dashboard

- Status: ✅ Pass / ⚠️ Issues found / 🔧 Auto-fixed
- Screenshot: [description of what was seen]
- Flows tested: [list]
- Notes: [anything notable]

[repeat per page]

## Auto-fixes Applied

[list any code changes made]

## Issues Requiring Review

[list anything that needs user decision]

## Context Updates

[list what was added to docs/app-context.md]
```

Share via share-markdown skill and post the URL in chat.
````

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/visual-validate/SKILL.md CLAUDE.md docs/app-context.md
git commit -m "feat: add visual-validate skill, CLAUDE.md, and app-context seed"
```

---

### Task 5: First validation run

Smoke-test the full ecosystem end to end.

- [ ] **Step 1: Verify dev server**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:9200
```

Expected: `200`. If not, run `npm run dev` and wait.

- [ ] **Step 2: Invoke visual-validate on dashboard**

Run `/visual-validate /dashboard` — follow the skill loop: navigate, screenshot, analyze, simulate portfolio switch flow, report.

- [ ] **Step 3: Verify report is shared**

Confirm a md-secure-viewer URL is posted in chat and accessible.

- [ ] **Step 4: Verify app-context.md was updated**

```bash
cat docs/app-context.md
```

Expected: `## Last Updated` has today's date and at least one discovered flow or component is noted.

- [ ] **Step 5: Final commit if any app-context updates**

```bash
git add docs/app-context.md
git commit -m "docs: update app-context from first visual-validate run"
```
