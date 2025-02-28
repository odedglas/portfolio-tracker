<template>
  <q-page class="row justify-center q-pa-md">
    <div class="col-10 column stocks-plan-wrapper q-py-md">
      <div class="q-mb-lg text-grey-7 plans-title">
        <p class="text-h5">
          {{ $t('stocks_plans.title') }}
        </p>

        <q-btn
          flat
          icon="add"
          color="primary"
          @click="() => openEntityModal(undefined)"
          :label="$t('stocks_plans.add')"
        />
      </div>

      <div
        class="plans-wrapper flex column"
        v-if="Object.keys(stocksPlansGroups).length"
      >
        <stocks-plans-group-details
          v-for="(plans, index) in stocksPlansGroups"
          @delete-plan="deleteEntity"
          @edit-plan="openEntityModal"
          @simulate-plan="simulateStocksPlan"
          :key="index"
          :plans="plans"
        />
      </div>
      <div v-else>
        <p class="text-body1">
          {{ $t('stocks_plans.empty_plans') }}
        </p>
      </div>
    </div>

    <stocks-plan-dialog
      :show="showModal"
      @close="hideEntityModal"
      :plan="editEntity"
    />

    <stocks-plan-simulator
      ref="simulatorRef"
      :plans="stocksPlansStore.stocksPlans"
    />
  </q-page>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import groupBy from 'lodash/groupBy';
import StocksPlansGroupDetails from 'components/stocksPlan/StocksPlansGroupDetails.vue';
import { useEditableEntityPage } from 'components/composables/useEditableEntityPage';
import { StocksPlan } from 'app/shared/types';
import StocksPlanDialog from 'components/stocksPlan/StocksPlanDialog.vue';
import { useStocksPlansStore } from 'stores/stocksPlans';
import StocksPlanSimulator from 'components/stocksPlan/StocksPlanSimulator.vue';

export default defineComponent({
  name: 'StocksPlans',
  components: {
    StocksPlanSimulator,
    StocksPlanDialog,
    StocksPlansGroupDetails,
  },
  setup() {
    const simulatorRef = ref<InstanceType<typeof StocksPlanSimulator> | null>(
      null
    );
    const stocksPlansStore = useStocksPlansStore();

    const {
      editEntity,
      showModal,
      openEntityModal,
      hideEntityModal,
      deleteEntity,
    } = useEditableEntityPage<StocksPlan>({
      deleteModal: {
        title: 'Delete Stocks Plan',
        message: (plan) =>
          `Are you sure you want to delete the following stocks plan: ${plan.identifier} of "${plan.name}"?`,
        callback: async (plan) => stocksPlansStore.updateStocksPlan(plan, true),
      },
    });

    const simulateStocksPlan = (plan: StocksPlan) => {
      if (!simulatorRef.value) {
        return;
      }

      simulatorRef.value.selectedEntry = plan;
      simulatorRef.value.showSimulator = true;
    };

    const stocksPlansGroups = computed(() =>
      groupBy(stocksPlansStore.stocksPlans, 'ticker')
    );

    return {
      stocksPlansStore,
      editEntity,
      showModal,
      openEntityModal,
      deleteEntity,
      hideEntityModal,
      stocksPlansGroups,
      simulateStocksPlan,
      simulatorRef,
    };
  },
});
</script>

<style lang="scss">
.stocks-plan-wrapper {
  .plans-title {
    display: flex;
    justify-content: space-between;
  }

  .plans-wrapper {
    gap: 24px;
  }
}
</style>
