<template>
  <div class="row items-center justify-between">
    <p class="text-subtitle1 text-bold">
      {{ plan.name }} - {{ plan.identifier }}
    </p>
    <p class="text-caption" v-if="plan.entitlement102Date">
      102 Entitlement Date: {{ formatPlanDate(plan.entitlement102Date) }}
    </p>
  </div>
  <q-tabs
    v-model="activeTab"
    dense
    class="text-grey"
    active-color="primary"
    indicator-color="primary"
    align="justify"
    narrow-indicator
  >
    <q-tab name="vestingDetails" label="Vesting Details" no-caps />
    <q-tab
      name="planOrders"
      label="Plan Orders"
      no-caps
      :disable="plan.orders.length === 0"
    />
  </q-tabs>
  <q-separator />
  <q-tab-panels v-model="activeTab" animated>
    <q-tab-panel name="vestingDetails">
      <div class="row">
        <vesting-periods-list :plan="plan" />
        <div class="col-3 q-px-md q-pt-sm">
          <apexchart
            chart="radialProgress"
            height="300"
            :options="planVestingPercentChartOptions"
            :series="planVestingPercentChartOptions.series"
          ></apexchart>
        </div>
      </div>
    </q-tab-panel>
    <q-tab-panel name="planOrders">
      <stocks-plan-orders-list
        :orders="plan.orders"
        @delete-order="openDeleteOrderModal"
      />
    </q-tab-panel>
  </q-tab-panels>
  <div class="flex justify-end q-pa-md q-gutter-md">
    <q-btn
      color="negative"
      v-if="!plan.terminationDate && !isESPP"
      :label="$t('stocks_plans.terminate_plan')"
      @click="terminatePlan"
    />
    <q-btn
      v-if="plan.sellableValue"
      color="primary"
      type="submit"
      @click="() => openOrderModal(undefined)"
      label="Exercise stocks"
    />
  </div>
  <stocks-plan-order-dialog
    :plan="plan"
    :show="showOrderModal"
    :plan-order="planOrder"
    @close="hideOrderModal"
  />
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import VueApexCharts from 'vue3-apexcharts';
import { StockPlanOrder, StocksPlan } from 'app/shared/types';
import { formatPlanDate } from 'src/service/date';
import VestingPeriodsList from 'components/stocksPlan/VestingPeriodsList.vue';
import { useStocksPlansStore } from 'stores/stocksPlans';
import { useLoadingStore } from 'stores/loading';
import { vestingPie } from 'src/service/charts';
import { useEditableEntityPage } from 'components/composables/useEditableEntityPage';
import StocksPlanOrderDialog from 'components/stocksPlan/StocksPlanOrderDialog.vue';
import StocksPlanOrdersList from 'components/stocksPlan/StocksPlanOrdersList.vue';

export default defineComponent({
  name: 'StocksPlanExtendedDetails',
  components: {
    StocksPlanOrdersList,
    StocksPlanOrderDialog,
    VestingPeriodsList,
    apexchart: VueApexCharts,
  },
  props: {
    plan: {
      type: Object as PropType<StocksPlan>,
      required: true,
    },
  },
  setup(props) {
    const activeTab = ref('vestingDetails');

    const $q = useQuasar();
    const $t = useI18n().t;

    const { emitLoadingTask } = useLoadingStore();
    const stocksPlansStore = useStocksPlansStore();

    const {
      editEntity,
      showModal,
      openEntityModal,
      hideEntityModal,
      deleteEntity,
    } = useEditableEntityPage<StockPlanOrder>({
      deleteModal: {
        title: 'Delete Stocks Order',
        message: (order) =>
          `Are you sure you want to delete the following order: ${order.id} from plan: "${props.plan.identifier}"?`,
        callback: (order) =>
          stocksPlansStore.removeStocksPlanOrder(props.plan, order.id),
      },
    });

    const planVestingPercentChartOptions = computed(() => {
      const vestingPercent = (
        100 *
        ((props.plan?.vested ?? 0) / props.plan.amount)
      ).toFixed(2);

      return vestingPie(vestingPercent);
    });

    const terminatePlan = async () => {
      $q.dialog({
        title: 'Terminate Plan',
        message: `Are you sure you wish to terminate the following grant: ${props.plan.identifier}?`,
        ok: {
          label: $t('yes'),
          color: 'primary',
        },
        cancel: {
          label: $t('no'),
          color: 'negative',
        },
      }).onOk(async () =>
        emitLoadingTask(async () => {
          await stocksPlansStore.terminateStocksPlan(props.plan);
        })
      );
    };

    const isESPP = computed(() => props.plan?.type === 'espp');

    const hasVestingPeriodsPlan = computed(() => !isESPP.value);

    return {
      activeTab,
      formatPlanDate,
      planVestingPercentChartOptions,
      hasVestingPeriodsPlan,
      terminatePlan,
      isESPP,
      showOrderModal: showModal,
      hideOrderModal: hideEntityModal,
      openOrderModal: openEntityModal,
      openDeleteOrderModal: deleteEntity,
      planOrder: editEntity,
    };
  },
});
</script>

<style lang="scss"></style>
