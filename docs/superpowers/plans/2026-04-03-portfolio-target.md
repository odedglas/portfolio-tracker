# Portfolio Target Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a milestone strip section to the dashboard showing progress toward a user-defined portfolio target value.

**Architecture:** Expose `target` data from the existing `usePortfolioKpis` composable, create a new `PortfolioTarget.vue` component that renders a milestone strip, and wire it into `Dashboard.vue` conditionally. No data layer changes — `Portfolio.target`, the transformer calculation, and the dialog input all already exist.

**Tech Stack:** Vue 3 (Options API, `defineComponent`), Quasar 2, TypeScript, Pinia, Vite/Quasar aliases (`src/`, `app/`, `components/`, `stores/`)

---

## File Map

| File | Action |
|---|---|
| `src/components/composables/usePortfolioKpis.ts` | Modify — expose `target` computed |
| `src/components/dashboard/PortfolioTarget.vue` | **Create** — milestone strip component |
| `src/pages/Dashboard.vue` | Modify — import + render `PortfolioTarget` conditionally |

---

### Task 1: Expose `target` from `usePortfolioKpis`

**Files:**
- Modify: `src/components/composables/usePortfolioKpis.ts`

**Context:** The composable currently returns `{ kpis }`. `portfoliosTransformer.portfolioKPIS(portfolio)` already computes `target.percentage = (currentValue + cashFlow) / portfolio.target`. We need to also expose a `target` ref that is `null` when no target is set.

The full current file content of `src/components/composables/usePortfolioKpis.ts`:
```ts
import { computed } from 'vue';
import { portfoliosTransformer } from 'app/shared/transformers';
import { usePortfolioStore } from 'src/stores/portfolios';
import { useI18n } from 'vue-i18n';

export const usePortfolioKpis = () => {
  const $t = useI18n().t;
  const portfolioStore = usePortfolioStore();

  const kpis = computed(() => {
    const portfolio = portfolioStore.selectedPortfolioWithHoldings;
    if (!portfolio) {
      return [];
    }

    const portfolioKpis = portfoliosTransformer.portfolioKPIS(portfolio);

    return [
      {
        id: 'balance',
        title: $t('dashboard.kpis.value'),
        value: portfolio.currentValue ?? 0,
        icon: 'balance',
        subtitle: {
          text: 'invested',
          value: portfolio.invested ?? 0,
        },
      },
      {
        id: 'profits',
        title: $t('dashboard.kpis.profit'),
        value: portfolioKpis.profit.value ?? 0,
        valuePercentage: portfolioKpis.profit.percentage,
        showValueSign: true,
        tooltip: {
          capital: portfolio.capitalGains ?? 0,
          realized: portfoliosTransformer.realizedGains(portfolio),
          fees: (portfolio.fees ?? 0) * -1,
        },
        icon: 'trending_up',
        subtitle: {
          text: 'daily',
          value: portfolioKpis.dailyChange.value,
          percentage: portfolioKpis.dailyChange.percentage,
          className:
            portfolioKpis.dailyChange.value >= 0
              ? 'text-green-5'
              : 'text-red-5',
        },
      },
      {
        id: 'cashflow',
        title: $t('dashboard.kpis.cash_flow'),
        value: portfoliosTransformer.cashFlow(portfolio),
        icon: 'account_balance',
        subtitle: {
          text: 'deposited',
          value: portfoliosTransformer.depositsValue(portfolio),
        },
      },
    ];
  });

  return { kpis };
};
```

- [ ] **Step 1: Write a failing test**

This project has no unit test framework set up for Vue composables, so we validate via TypeScript compilation and runtime. Instead, write a type-level test by verifying the return shape — add a test assertion block at the bottom of the file temporarily, then remove it. Skip to Step 2.

- [ ] **Step 2: Implement the `target` computed**

Replace the entire file content of `src/components/composables/usePortfolioKpis.ts` with:

```ts
import { computed } from 'vue';
import { portfoliosTransformer } from 'app/shared/transformers';
import { usePortfolioStore } from 'src/stores/portfolios';
import { useI18n } from 'vue-i18n';

export const usePortfolioKpis = () => {
  const $t = useI18n().t;
  const portfolioStore = usePortfolioStore();

  const kpis = computed(() => {
    const portfolio = portfolioStore.selectedPortfolioWithHoldings;
    if (!portfolio) {
      return [];
    }

    const portfolioKpis = portfoliosTransformer.portfolioKPIS(portfolio);

    return [
      {
        id: 'balance',
        title: $t('dashboard.kpis.value'),
        value: portfolio.currentValue ?? 0,
        icon: 'balance',
        subtitle: {
          text: 'invested',
          value: portfolio.invested ?? 0,
        },
      },
      {
        id: 'profits',
        title: $t('dashboard.kpis.profit'),
        value: portfolioKpis.profit.value ?? 0,
        valuePercentage: portfolioKpis.profit.percentage,
        showValueSign: true,
        tooltip: {
          capital: portfolio.capitalGains ?? 0,
          realized: portfoliosTransformer.realizedGains(portfolio),
          fees: (portfolio.fees ?? 0) * -1,
        },
        icon: 'trending_up',
        subtitle: {
          text: 'daily',
          value: portfolioKpis.dailyChange.value,
          percentage: portfolioKpis.dailyChange.percentage,
          className:
            portfolioKpis.dailyChange.value >= 0
              ? 'text-green-5'
              : 'text-red-5',
        },
      },
      {
        id: 'cashflow',
        title: $t('dashboard.kpis.cash_flow'),
        value: portfoliosTransformer.cashFlow(portfolio),
        icon: 'account_balance',
        subtitle: {
          text: 'deposited',
          value: portfoliosTransformer.depositsValue(portfolio),
        },
      },
    ];
  });

  const target = computed(() => {
    const portfolio = portfolioStore.selectedPortfolioWithHoldings;
    if (!portfolio?.target) return null;

    const portfolioKpis = portfoliosTransformer.portfolioKPIS(portfolio);
    const cashFlow = portfoliosTransformer.cashFlow(portfolio);

    return {
      targetAmount: portfolio.target,
      currentValue: portfolio.currentValue + cashFlow,
      percentage: portfolioKpis.target.percentage,
    };
  });

  return { kpis, target };
};
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/odedgo/Development/portfolio-tracker && npx vue-tsc --noEmit 2>&1 | head -30
```

Expected: no errors related to `usePortfolioKpis`. If you see errors about missing properties, check the `portfoliosTransformer.portfolioKPIS` return shape in `shared/transformers/portfolios.ts` — it returns `{ target: { value, percentage }, profit, dailyChange }`.

- [ ] **Step 4: Commit**

```bash
git add src/components/composables/usePortfolioKpis.ts
git commit -m "feat: expose target data from usePortfolioKpis composable"
```

---

### Task 2: Create `PortfolioTarget.vue` milestone strip component

**Files:**
- Create: `src/components/dashboard/PortfolioTarget.vue`

**Context:** This component receives `currentValue`, `targetAmount`, and `percentage` as props and renders:
1. A header line: "Goal: $X"
2. A horizontal track bar (filled up to `min(percentage, 1) * 100%`)
3. Four milestone dots at 25%, 50%, 75%, 100% — each labeled with the abbreviated dollar value at that milestone
4. A position bubble at `min(percentage, 1) * 100%` showing current value + percentage
5. When `percentage >= 1`: bar is fully filled, bubble replaced with "Target reached! 🎯"

The component follows the existing Options API pattern (`defineComponent`) used throughout the codebase. Use Quasar's `useQuasar` for `$n` number formatting, or use `useI18n` — actually, looking at the codebase, `$n` is available as a template global from Quasar's i18n plugin. Use `$n(val, 'decimal')` in templates for full values. For abbreviated values in the milestone labels, use a local `abbreviate()` helper.

- [ ] **Step 1: Create the file**

Create `src/components/dashboard/PortfolioTarget.vue` with this full content:

```vue
<template>
  <q-card flat class="portfolio-target q-pa-md">
    <div class="flex items-center justify-between q-mb-sm">
      <span class="text-subtitle1 text-grey-7">
        Goal: {{ $n(targetAmount, 'decimal') }}
      </span>
      <span v-if="isReached" class="text-positive text-subtitle2">
        <q-icon name="emoji_events" size="sm" class="q-mr-xs" />
        Target reached!
      </span>
      <span v-else class="text-subtitle2 text-grey-6">
        {{ $n(currentValue, 'decimal') }} &middot;
        {{ (Math.min(percentage, 1) * 100).toFixed(1) }}%
      </span>
    </div>

    <div class="target-track-wrapper">
      <!-- Filled progress bar -->
      <div class="target-track">
        <div
          class="target-track__fill bg-primary"
          :style="{ width: fillWidth }"
        />
      </div>

      <!-- Milestone dots + labels -->
      <div
        v-for="milestone in milestones"
        :key="milestone.percentage"
        class="target-milestone"
        :style="{ left: milestone.percentage * 100 + '%' }"
      >
        <div
          class="target-milestone__dot"
          :class="percentage >= milestone.percentage ? 'bg-primary' : 'bg-grey-4'"
        />
        <span class="target-milestone__label text-caption text-grey-6">
          {{ abbreviate(milestone.value) }}
        </span>
      </div>

      <!-- Current position indicator -->
      <div
        v-if="!isReached"
        class="target-position"
        :style="{ left: fillWidth }"
      >
        <div class="target-position__dot bg-primary" />
      </div>
    </div>
  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'PortfolioTarget',

  props: {
    currentValue: {
      type: Number,
      required: true,
    },
    targetAmount: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
  },

  setup(props) {
    const isReached = computed(() => props.percentage >= 1);

    const fillWidth = computed(
      () => `${Math.min(props.percentage, 1) * 100}%`
    );

    const milestones = computed(() =>
      [0.25, 0.5, 0.75, 1].map((p) => ({
        percentage: p,
        value: props.targetAmount * p,
      }))
    );

    const abbreviate = (val: number): string => {
      if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
      if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}k`;
      return `$${val}`;
    };

    return {
      isReached,
      fillWidth,
      milestones,
      abbreviate,
    };
  },
});
</script>

<style lang="scss" scoped>
.portfolio-target {
  width: 100%;
}

.target-track-wrapper {
  position: relative;
  padding-bottom: 24px; // space for milestone labels below the track
  margin: 0 8px; // slight indent so 100% milestone dot isn't clipped
}

.target-track {
  height: 8px;
  background: $grey-3;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.target-track__fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;
}

.target-milestone {
  position: absolute;
  top: -4px; // align dot center with track center
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.target-milestone__dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 0 1px $grey-4;
}

.target-milestone__label {
  margin-top: 4px;
  white-space: nowrap;
}

.target-position {
  position: absolute;
  top: -6px;
  transform: translateX(-50%);
}

.target-position__dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/odedgo/Development/portfolio-tracker && npx vue-tsc --noEmit 2>&1 | head -30
```

Expected: no new errors. If you see `$n is not defined` — it's a Quasar template global, not an import. It's injected via the i18n boot plugin. No fix needed in the component.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/PortfolioTarget.vue
git commit -m "feat: add PortfolioTarget milestone strip component"
```

---

### Task 3: Wire `PortfolioTarget` into `Dashboard.vue`

**Files:**
- Modify: `src/pages/Dashboard.vue`

**Context:** The dashboard uses a CSS grid. We need to:
1. Import and register `PortfolioTarget`
2. Expose `target` from `usePortfolioKpis` in `setup()`
3. Add the component to the template with `v-if="target"`
4. Add a `target` grid area between the `kpi` row and `donut/heatmap` row

The full current file content of `src/pages/Dashboard.vue`:
```vue
<template>
  <q-page class="row justify-center q-pa-md">
    <div class="col-10 dashboard-grid">
      <p class="text-h5 text-grey-7 dashboard-title">
        Portfolio's / {{ viewPortfolio?.title }}
      </p>
      <div v-for="(kpi, index) in kpis" :key="kpi.title" class="col">
        <dashboard-kpi v-bind="kpi" :class="`dashboard-kpi-${index}`" />
      </div>
      <holdings-donut class="col-8 dashboard-holdings-donut q-mt-lg" />
      <portfolio-heat-map class="dashboard-portfolio-heat-map" />
      <daily-movers class="dashboard-daily-movers" />
      <portfolio-insights class="dashboard-portfolio-insights" />
    </div>
    <sticky-quick-add />
  </q-page>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { usePortfolioStore } from 'stores/portfolios';
import { usePortfolioKpis } from 'src/components/composables/usePortfolioKpis';
import DashboardKpi from 'components/dashboard/DashboardKPI.vue';
import HoldingsDonut from 'components/dashboard/HoldingsDonut.vue';
import PortfolioHeatMap from 'components/dashboard/PortfolioHeatMap.vue';
import PortfolioInsights from 'components/dashboard/PortfolioInsights.vue';
import DailyMovers from 'components/dashboard/DailyMovers.vue';
import StickyQuickAdd from 'components/dashboard/StickyQuickAdd.vue';

export default defineComponent({
  name: 'DashboardPage',
  components: {
    StickyQuickAdd,
    DailyMovers,
    PortfolioHeatMap,
    HoldingsDonut,
    DashboardKpi,
    PortfolioInsights,
  },
  setup() {
    const portfolioStore = usePortfolioStore();
    const { kpis } = usePortfolioKpis();

    const viewPortfolio = computed(
      () => portfolioStore.selectedPortfolioWithHoldings
    );

    return {
      viewPortfolio,
      kpis,
    };
  },
});
</script>

<style lang="scss">
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(4, auto);
  grid-column-gap: 16px;
  grid-template-areas:
    'title title title'
    'kpi kpi kpi'
    'donut donut heatmap'
    'daily_movers daily_movers daily_movers'
    'insights insights insights';
}

.dashboard-quick-add {
  height: 40px;
}

.dashboard-title {
  grid-area: title;
}
.dashboard-holdings-donut {
  grid-area: donut;
}

.dashboard-portfolio-heat-map {
  grid-area: heatmap;
}
.dashboard-daily-movers {
  grid-area: daily_movers;
}
.dashboard-portfolio-insights {
  grid-area: insights;
}
</style>
```

- [ ] **Step 1: Replace the entire file**

Replace `src/pages/Dashboard.vue` with:

```vue
<template>
  <q-page class="row justify-center q-pa-md">
    <div class="col-10 dashboard-grid">
      <p class="text-h5 text-grey-7 dashboard-title">
        Portfolio's / {{ viewPortfolio?.title }}
      </p>
      <div v-for="(kpi, index) in kpis" :key="kpi.title" class="col">
        <dashboard-kpi v-bind="kpi" :class="`dashboard-kpi-${index}`" />
      </div>
      <portfolio-target
        v-if="target"
        class="dashboard-portfolio-target"
        :current-value="target.currentValue"
        :target-amount="target.targetAmount"
        :percentage="target.percentage"
      />
      <holdings-donut class="col-8 dashboard-holdings-donut q-mt-lg" />
      <portfolio-heat-map class="dashboard-portfolio-heat-map" />
      <daily-movers class="dashboard-daily-movers" />
      <portfolio-insights class="dashboard-portfolio-insights" />
    </div>
    <sticky-quick-add />
  </q-page>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { usePortfolioStore } from 'stores/portfolios';
import { usePortfolioKpis } from 'src/components/composables/usePortfolioKpis';
import DashboardKpi from 'components/dashboard/DashboardKPI.vue';
import HoldingsDonut from 'components/dashboard/HoldingsDonut.vue';
import PortfolioHeatMap from 'components/dashboard/PortfolioHeatMap.vue';
import PortfolioInsights from 'components/dashboard/PortfolioInsights.vue';
import DailyMovers from 'components/dashboard/DailyMovers.vue';
import StickyQuickAdd from 'components/dashboard/StickyQuickAdd.vue';
import PortfolioTarget from 'components/dashboard/PortfolioTarget.vue';

export default defineComponent({
  name: 'DashboardPage',
  components: {
    StickyQuickAdd,
    DailyMovers,
    PortfolioHeatMap,
    HoldingsDonut,
    DashboardKpi,
    PortfolioInsights,
    PortfolioTarget,
  },
  setup() {
    const portfolioStore = usePortfolioStore();
    const { kpis, target } = usePortfolioKpis();

    const viewPortfolio = computed(
      () => portfolioStore.selectedPortfolioWithHoldings
    );

    return {
      viewPortfolio,
      kpis,
      target,
    };
  },
});
</script>

<style lang="scss">
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(5, auto);
  grid-column-gap: 16px;
  grid-template-areas:
    'title title title'
    'kpi kpi kpi'
    'target target target'
    'donut donut heatmap'
    'daily_movers daily_movers daily_movers'
    'insights insights insights';
}

.dashboard-quick-add {
  height: 40px;
}

.dashboard-title {
  grid-area: title;
}
.dashboard-portfolio-target {
  grid-area: target;
}
.dashboard-holdings-donut {
  grid-area: donut;
}

.dashboard-portfolio-heat-map {
  grid-area: heatmap;
}
.dashboard-daily-movers {
  grid-area: daily_movers;
}
.dashboard-portfolio-insights {
  grid-area: insights;
}
</style>
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/odedgo/Development/portfolio-tracker && npx vue-tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Dashboard.vue
git commit -m "feat: render PortfolioTarget section on dashboard when target is set"
```
