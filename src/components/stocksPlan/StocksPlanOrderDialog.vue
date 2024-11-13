<template>
  <base-dialog
    :show="show"
    @close="$emit('close')"
    :on-submit="submitForm"
    :title="
      isNew
        ? $t('stocks_plans.order.new')
        : `${$t('stocks_plans.order.edit')}: ${localPlanOrder?.id}`
    "
    :before-show="setLocalOrderPlan"
  >
    <q-input
      v-model.number="localPlanOrder.shares"
      class="col"
      type="number"
      lazy-rules
      label="Shares amount"
      :rules="[
        (val) =>
          (val && val > 0 && val <= (plan.availableShares ?? 0)) ||
          `Please enter a shares amount and less than ${plan.vested ?? 0}`,
      ]"
    />

    <q-input
      v-model.number="localPlanOrder.price"
      class="col"
      type="number"
      lazy-rules
      suffix="$"
      label="Sell Price"
      :rules="[(val) => (val && val > 0) || 'Please enter a valid price']"
    />

    <q-input
      class="col"
      v-model="formattedOrderDate"
      label="Exercise Date"
      lazy-rules
      :rules="[
        (val) =>
          (val && typeof new Date(val).getTime === 'function') ||
          'Please set a valid date',
      ]"
    >
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date v-model="formattedOrderDate" mask="MMM D, YYYY">
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
  </base-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, toRef, Ref } from 'vue';
import { useLoadingStore } from 'stores/loading';
import { StockPlanOrder, StocksPlan } from 'app/shared/types';
import { formatPlanDate } from 'src/service/date';
import { useStocksPlansStore } from 'stores/stocksPlans';
import { uid } from 'src/utils';
import BaseDialog from 'components/common/BaseDialog.vue';

const emptyOrder = (): StockPlanOrder => ({
  id: uid(),
  date: 0,
  price: 0,
  shares: 0,
});

export default defineComponent({
  name: 'StocksPlanOrderDialog',
  components: { BaseDialog },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    planOrder: {
      type: Object as PropType<StockPlanOrder | undefined>,
    },
    plan: {
      type: Object as PropType<StocksPlan>,
      required: true,
    },
  },
  emits: ['close'],
  setup(props) {
    const { emitLoadingTask } = useLoadingStore();
    const stocksPlansStore = useStocksPlansStore();

    const localPlanOrder = toRef(props.planOrder) as Ref<StockPlanOrder>;

    const isNew = computed(() => localPlanOrder?.value?.id === '');

    const formattedOrderDate = computed({
      get: () => {
        return localPlanOrder.value.date
          ? formatPlanDate(localPlanOrder.value.date)
          : undefined;
      },
      set: (date: string) => {
        localPlanOrder.value.date = new Date(date).getTime();
      },
    });

    const setLocalOrderPlan = () => {
      localPlanOrder.value = {
        ...(props.planOrder || emptyOrder()),
      };
    };

    const submitForm = async () => {
      await emitLoadingTask(() =>
        stocksPlansStore.updateStocksPlanOrder(props.plan, localPlanOrder.value)
      );
    };

    return {
      isNew,
      localPlanOrder,
      setLocalOrderPlan,
      submitForm,
      formattedOrderDate,
    };
  },
});
</script>
