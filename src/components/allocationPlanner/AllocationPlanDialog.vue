<template>
  <base-dialog
    :show="show"
    @close="$emit('close')"
    :on-submit="submitForm"
    :title="
      isNew
        ? $t('portfolios.allocation_planner.new_allocation')
        : `${$t('portfolios.allocation_planner.edit_allocation')}`
    "
    :before-show="setLocalPlan"
  >
    <ticker-search
      :ticker="localPlan.ticker || ''"
      :disabled="!isNew"
      :ticker-meta="{
        display: localPlan.name,
        logo: localPlan.logoImage,
      }"
      @update:tickerValue="onTickerOptionSelect"
    />

    <q-input
      v-model.number="localPlan.shares"
      class="col"
      type="number"
      lazy-rules
      label="Shares amount"
      :rules="[(val) => validateTotalValue(val, localPlan.targetPrice, true)]"
    />

    <q-input
      v-model.number="localPlan.targetPrice"
      class="col"
      type="number"
      lazy-rules
      suffix="$"
      label="Target Price"
      :rules="[(val) => validateTotalValue(localPlan.shares, val)]"
    />

    <div class="flex column q-gap-sm">
      <span class="text-caption text-grey-7"
        >Total Value:
        {{ $n(localPlan.shares * localPlan.targetPrice, 'decimal') }}</span
      >
      <span class="text-caption text-grey-7"
        >Available allocation flow:
        {{ $n(enforcedAllocationAmount, 'decimal') }}</span
      >
    </div>
  </base-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, toRef, Ref } from 'vue';
import { useLoadingStore } from 'stores/loading';
import { AllocationPlan } from 'app/shared/types';
import TickerSearch, { TickerOption } from 'components/common/TickerSearch.vue';
import { uid } from 'src/utils';
import { useAllocationPlansStore } from 'stores/allocationPlans';
import BaseDialog from 'components/common/BaseDialog.vue';

const emptyPlan = (): AllocationPlan => ({
  id: '',
  shares: 0,
  targetPrice: 0,
  name: '',
  ticker: '',
  logoImage: '',
});

export default defineComponent({
  name: 'AllocationPlanDialog',
  components: { BaseDialog, TickerSearch },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    plan: {
      type: Object as PropType<AllocationPlan | undefined>,
    },
    availableAllocationAmount: {
      type: Number,
      required: true,
    },
  },
  emits: ['close'],
  setup(props) {
    const { emitLoadingTask } = useLoadingStore();
    const allocationPlansStore = useAllocationPlansStore();

    const localPlan = toRef(props.plan) as Ref<AllocationPlan>;

    const isNew = computed(() => localPlan?.value?.id === '');

    const setLocalPlan = () => {
      localPlan.value = {
        ...(props.plan || emptyPlan()),
      };
    };

    const enforcedAllocationAmount = computed(() => {
      if (!isNew.value) {
        return (
          props.availableAllocationAmount + (localPlan.value.totalValue ?? 0)
        );
      }

      return props.availableAllocationAmount;
    });

    const submitForm = async () => {
      localPlan.value.id ||= uid();
      localPlan.value.totalValue =
        localPlan.value.shares * localPlan.value.targetPrice;

      const plan = localPlan.value;

      await emitLoadingTask(() =>
        allocationPlansStore.updateAllocationPlan(plan)
      );
    };

    const onTickerOptionSelect = (tickerOption: TickerOption) => {
      localPlan.value.ticker = tickerOption?.value || '';
      localPlan.value.name = tickerOption?.label;
      localPlan.value.logoImage = tickerOption?.logoImage ?? '';
    };

    const validateTotalValue = (
      shares: number,
      price: number,
      isShares = false
    ) => {
      if (!shares && isShares) {
        return 'Please enter a valid shares amount';
      }

      if (!price && !isShares) {
        return 'Please enter a valid target price';
      }

      return (
        shares * price <= enforcedAllocationAmount.value ||
        'Total value exceeds available funds'
      );
    };

    return {
      isNew,
      localPlan,
      setLocalPlan,
      submitForm,
      onTickerOptionSelect,
      validateTotalValue,
      enforcedAllocationAmount,
    };
  },
});
</script>
