<template>
  <div class="flex q-gap-md items-center text-subtitle1">
    <span class="text-grey-7"
      >{{ $t('portfolios.allocation_planner.free_cash') }}:</span
    >
    <span>{{ $n(portfolioStore.freeCashFlow, 'currency') }}</span>
  </div>
  <q-separator vertical />
  <div class="flex q-gap-md items-center text-subtitle1">
    <span class="text-grey-7"
      >{{ $t('portfolios.allocation_planner.current_planned') }}:</span
    >
    <span>{{ $n(allocationDetails.plannedValue, 'currency') }}</span>
  </div>
  <q-separator vertical />
  <div class="flex q-gap-md items-center text-subtitle1">
    <span class="text-grey-7"
      >{{ $t('portfolios.allocation_planner.available_cash') }}:</span
    >
    <span>{{ $n(allocationDetails.availableCash, 'decimal') }}</span>
  </div>
  <q-separator vertical />
  <div class="flex q-gap-md items-center text-subtitle1">
    <span class="text-grey-7"
      >{{ $t('portfolios.allocation_planner.allocation_usage') }}:</span
    >
    <span>{{ $n(allocationDetails.allocationUsage, 'percent') }}</span>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useAllocationPlansStore } from 'stores/allocationPlans';
import { usePortfolioStore } from 'stores/portfolios';

export default defineComponent({
  name: 'AllocationsPannerSummary',
  setup() {
    const portfolioStore = usePortfolioStore();
    const allocationsPlansStore = useAllocationPlansStore();

    const allocationDetails = computed(
      () => allocationsPlansStore.allocationsSummary
    );

    return {
      portfolioStore,
      allocationDetails,
    };
  },
});
</script>
