<template>
  <q-dialog
    v-model="syntheticShow"
    backdrop-filter="blur(4px)"
    @before-show="setLocalPlan"
  >
    <q-card style="min-width: 450px">
      <q-card-section class="row items-center q-pa-none">
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title class="row items-center">
            <q-icon name="grading" class="q-mr-md" />
            {{
              isNew
                ? $t('portfolios.allocation_planner.new_allocation')
                : `${$t('portfolios.allocation_planner.edit_allocation')}`
            }}
          </q-toolbar-title>
          <q-btn flat round dense icon="close" @click="$emit('close')" />
        </q-toolbar>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form ref="formRef" class="q-gutter-sm">
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
            :rules="[
              (val) => validateTotalValue(val, localPlan.targetPrice, true),
            ]"
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
              {{
                $n(localPlan.shares * localPlan.targetPrice, 'decimal')
              }}</span
            >
            <span class="text-caption text-grey-7"
              >Available Cash:
              {{ $n(availableAllocationAmount, 'decimal') }}</span
            >
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="$t('cancel')" @click="$emit('close')" />
        <q-btn
          color="primary"
          type="submit"
          :label="$t('save')"
          @click="submitForm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, ref, toRef, Ref } from 'vue';
import { useLoadingStore } from 'stores/loading';
import { AllocationPlan } from 'app/shared/types';
import TickerSearch, { TickerOption } from 'components/common/TickerSearch.vue';
import { usePortfolioStore } from 'stores/portfolios';
import { uid } from 'src/utils';

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
  components: { TickerSearch },
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
  setup(props, { emit }) {
    const { emitLoadingTask } = useLoadingStore();
    const portfolioStore = usePortfolioStore();

    const formRef: Ref<{ validate: () => Promise<void> } | undefined> =
      ref(undefined);
    const localPlan = toRef(props.plan) as Ref<AllocationPlan>;

    const syntheticShow = computed({
      get: () => props.show,
      set: (value: boolean) => {
        if (!value) {
          emit('close', undefined);
        }
      },
    });

    const isNew = computed(() => localPlan?.value?.id === '');

    const setLocalPlan = () => {
      localPlan.value = {
        ...(props.plan || emptyPlan()),
      };
    };
    const submitForm = async () => {
      localPlan.value.id ||= uid();
      localPlan.value.totalValue =
        localPlan.value.shares * localPlan.value.targetPrice;

      if (await formRef.value?.validate()) {
        const plan = localPlan.value;

        await emitLoadingTask(() => portfolioStore.updateAllocationPlan(plan));

        emit('close');
      }
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
        shares * price <= props.availableAllocationAmount ||
        'Total value exceeds available funds'
      );
    };

    return {
      formRef,
      syntheticShow,
      isNew,
      localPlan,
      setLocalPlan,
      submitForm,
      onTickerOptionSelect,
      validateTotalValue,
    };
  },
});
</script>
