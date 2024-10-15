<template>
  <q-dialog
    v-model="syntheticShow"
    backdrop-filter="blur(4px)"
    @before-show="setLocalOrderPlan"
  >
    <q-card style="min-width: 450px">
      <q-card-section class="row items-center q-pa-none">
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title class="row items-center">
            <q-icon name="grading" class="q-mr-md" />
            {{
              isNew
                ? $t('stocks_plans.order.new')
                : `${$t('stocks_plans.order.edit')}: ${localPlanOrder.id}`
            }}
          </q-toolbar-title>
          <q-btn flat round dense icon="close" @click="$emit('close')" />
        </q-toolbar>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-form ref="formRef" class="q-gutter-sm">
          <q-input
            v-model.number="localPlanOrder.shares"
            class="col"
            type="number"
            lazy-rules
            label="Shares amount"
            :rules="[
              (val) =>
                (val && val > 0 && val < (plan.availableShares ?? 0)) ||
                `Please enter a shares amount and less than ${
                  plan.vested ?? 0
                }`,
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
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="formattedOrderDate" mask="MMM D, YYYY">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
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
import { StockPlanOrder, StocksPlan } from 'app/shared/types';
import { formatPlanDate } from 'src/service/date';
import { usePortfolioStore } from 'stores/portfolios';

const emptyOrder = (): StockPlanOrder => ({
  id: (Math.random() + 1).toString(36).substring(7),
  date: 0,
  price: 0,
  shares: 0,
});

export default defineComponent({
  name: 'StocksPlanOrderDialog',
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
  setup(props, { emit }) {
    const { emitLoadingTask } = useLoadingStore();
    const portfolioStore = usePortfolioStore();

    const formRef: Ref<{ validate: () => Promise<void> } | undefined> =
      ref(undefined);
    const localPlanOrder = toRef(props.planOrder) as Ref<StockPlanOrder>;

    const syntheticShow = computed({
      get: () => props.show,
      set: (value: boolean) => {
        if (!value) {
          emit('close', undefined);
        }
      },
    });

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
      if (await formRef.value?.validate()) {
        await emitLoadingTask(() =>
          portfolioStore.updateStocksPlanOrder(props.plan, localPlanOrder.value)
        );

        emit('close');
      }
    };

    return {
      formRef,
      syntheticShow,
      isNew,
      localPlanOrder,
      setLocalOrderPlan,
      submitForm,
      formattedOrderDate,
    };
  },
});
</script>
