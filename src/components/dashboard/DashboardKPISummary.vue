<template>
  <q-card flat class="dashboard-kpis-card">
    <q-card-section class="flex items-center q-pb-sm">
      <span class="text-h5" style="min-width: 130px">
        {{ $n(balance?.value ?? 0, 'decimal') }}</span
      >
      <stealth-mode-button class="text-grey-6" />
    </q-card-section>
    <q-card-section>
      <div class="flex justify-between items-center">
        <span class="text-caption text-grey-6">Total Profit</span>
        <profit-indicator
          :value="profits?.value ?? 0"
          :percentage="profits?.valuePercentage ?? 0"
          class="q-gap-sm"
          show-value-sign
          show-separator
        />
      </div>
      <q-separator class="q-my-md" />
      <div class="flex justify-between items-center">
        <span class="text-caption text-grey-6">Daily</span>
        <profit-indicator
          :value="profits?.subtitle.value ?? 0"
          :percentage="profits?.subtitle.percentage ?? 0"
          class="q-gap-sm"
          show-value-sign
          show-separator
        />
      </div>
    </q-card-section>
    <q-separator />
    <q-card-section class="row items-center q-px-md">
      <div
        class="col"
        v-for="indicator in summaryIndicators"
        :key="indicator.title"
      >
        <div class="flex items-center">
          <span class="flex q-mr-xs icon-wrapper">
            <q-icon :name="indicator.icon" size="small" class="text-white" />
          </span>
          <span class="text-caption text-grey-6">{{ indicator.title }}</span>
        </div>
        <span class="text-subtitle1 text-weight-medium">{{
          $n(indicator.value ?? 0, 'decimal')
        }}</span>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { usePortfolioKpis } from 'components/composables/usePortfolioKpis';
import StealthModeButton from 'components/common/StealthModeButton.vue';
import ProfitIndicator from 'components/common/ProfitIndicator.vue';

export default defineComponent({
  name: 'DashboardKpiSummary',
  components: { ProfitIndicator, StealthModeButton },
  setup() {
    const { kpis } = usePortfolioKpis();

    const balance = computed(() => {
      return kpis.value?.find((kpi) => kpi.id === 'balance');
    });

    const profits = computed(() => {
      return kpis.value?.find((kpi) => kpi.id === 'profits');
    });

    const cashFlow = computed(() => {
      return kpis.value?.find((kpi) => kpi.id === 'cashflow');
    });

    const summaryIndicators = computed(() => {
      return [
        {
          title: 'Invested',
          value: balance.value?.subtitle.value,
          icon: balance.value?.icon,
        },
        { title: 'Cash', value: cashFlow.value?.value, icon: 'attach_money' },
        {
          title: 'Deposited',
          value: cashFlow.value?.subtitle.value,
          icon: cashFlow.value?.icon,
        },
      ];
    });

    return {
      kpis,
      balance,
      profits,
      cashFlow,
      summaryIndicators,
    };
  },
});
</script>

<style lang="scss">
.dashboard-kpis-card {
  .icon-wrapper {
    background: lighten($primary, 15%);
    padding: 2px;
    border-radius: 4px;
  }
}
</style>
