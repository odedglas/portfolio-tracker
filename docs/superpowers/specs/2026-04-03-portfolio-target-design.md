# Portfolio Target Feature — Design Spec

**Date:** 2026-04-03
**Issue:** #21
**Status:** Approved

---

## Goal

Allow users to set a financial target on a portfolio and see progress toward it on the dashboard as a milestone strip — visible only when a target is configured.

---

## What Already Exists

- `Portfolio.target: number` — already in the type and Firestore
- `PortfolioDialog.vue` — already has the `target` input field (no changes needed)
- `portfoliosTransformer.portfolioKPIS()` — already computes `target.value` and `target.percentage = (currentValue + cashFlow) / target`

Nothing in the data layer needs to change. This is purely a UI feature.

---

## Architecture

Three files touched, one new file created:

| File | Change |
|---|---|
| `src/components/composables/usePortfolioKpis.ts` | Expose `target` data from the transformer |
| `src/components/dashboard/PortfolioTarget.vue` | **New** — milestone strip component |
| `src/pages/Dashboard.vue` | Import and render `PortfolioTarget` conditionally |

---

## Component: `usePortfolioKpis` change

Add a `target` computed alongside `kpis`:

```ts
const target = computed(() => {
  const portfolio = portfolioStore.selectedPortfolioWithHoldings;
  if (!portfolio?.target) return null;

  const kpis = portfoliosTransformer.portfolioKPIS(portfolio);
  const cashFlow = portfoliosTransformer.cashFlow(portfolio);
  const currentValue = portfolio.currentValue + cashFlow;

  return {
    targetAmount: portfolio.target,               // the goal ($500k)
    currentValue,                                  // current value + cashFlow
    percentage: kpis.target.percentage,            // currentValue / targetAmount
  };
});

return { kpis, target };
```

Returns `null` when no target is set (portfolio.target is 0 or falsy). Consumers use this to conditionally render the section.

---

## Component: `PortfolioTarget.vue`

**Props:**
```ts
props: {
  currentValue: number,  // currentValue + cashFlow
  targetAmount: number,  // target goal amount
  percentage: number,    // currentValue / targetAmount, can exceed 1.0
}
```

**Milestone strip layout:**

```
Goal: $500,000

  ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━●
  |          |          |          |          |
 $125k      $250k      $375k      $500k

               ▲
           $310k · 62%
```

- Track: a horizontal bar (`q-linear-progress` or plain `div`) with `primary` color fill, clamped at 100%
- **Milestone dots:** 4 fixed markers at 25%, 50%, 75%, 100% — absolutely positioned on the track using `left: X%`. Each shows the dollar value (formatted with `$n` using `'decimal'` format, abbreviated for readability — e.g. `$125k`)
- **Current position bubble:** absolutely positioned at `min(percentage, 1) * 100%`, shows `$currentValue · XX%`. Uses a small Quasar chip or styled `span`
- **Over-target state:** when `percentage >= 1`, clamp bubble to 100%, show label "Target reached!" with a trophy/flag icon instead of value bubble
- **Header:** "Goal: $500,000" in `text-subtitle1 text-grey-7` above the strip (uses `$n(targetAmount, 'decimal')` for formatting)

**Value abbreviation helper** (local to component):
```ts
const abbreviate = (val: number) => {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}k`;
  return `$${val}`;
};
```

**Milestone values:** computed from `targetAmount` prop:
```ts
const milestones = computed(() => [0.25, 0.5, 0.75, 1].map(p => ({
  percentage: p,
  value: props.targetAmount * p,
})));
```

---

## Dashboard.vue integration

Add a new grid area `target` between the KPI row and the donut/heatmap row. Only rendered when `target` is non-null:

```html
<portfolio-target
  v-if="target"
  class="dashboard-portfolio-target"
  :current-value="target.currentValue"
  :target-amount="target.targetAmount"
  :percentage="target.percentage"
/>
```

Grid area added:
```scss
grid-template-areas:
  'title title title'
  'kpi kpi kpi'
  'target target target'   // new row, only occupies space when rendered
  'donut donut heatmap'
  'daily_movers daily_movers daily_movers'
  'insights insights insights';

.dashboard-portfolio-target {
  grid-area: target;
}
```

Since `v-if` removes the element from the DOM entirely, no empty space appears when no target is set.

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| `portfolio.target` is 0 or unset | `target` computed returns `null`, section hidden |
| `percentage > 1` (over target) | Bar clamped at 100%, bubble replaced with "Target reached!" label |
| `percentage` is `NaN` (target=0 and somehow reached) | Guard in composable: return `null` if `!portfolio.target` |
| Negative cashFlow (over-invested) | Formula handles it: `(currentValue + cashFlow) / target` may be lower, renders correctly |

---

## What Is NOT Changing

- `PortfolioDialog.vue` — target input already exists, no changes
- `portfoliosTransformer.portfolioKPIS()` — already computes target correctly, no changes
- Firestore / backend — no schema changes needed
- No new translations needed beyond what already exists (`portfolios.target`, `portfolios.target_explain`)
