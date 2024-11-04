<template>
  <q-fab
    v-bind="mainFabProp"
    vertical-actions-align="right"
  >
    <q-fab-action
      color="grey-3"
      text-color="primary"
      @click="() => (showPortfolioDialog = true)"
      icon="account_balance"
    />
    <q-fab-action
      color="grey-3"
      text-color="primary"
      @click="() => (showTransactionDialog = true)"
      icon="transform"
    />
    <q-fab-action
      color="grey-3"
      text-color="primary"
      @click="() => (showCashFlowDialog = true)"
      icon="attach_money"
    />
    <q-fab-action
      color="grey-3"
      text-color="primary"
      @click="() => (showStockPlanDialog = true)"
      icon="content_paste"
    />
  </q-fab>

  <portfolio-dialog
    :show="showPortfolioDialog"
    @close-portfolio="() => (showPortfolioDialog = false)"
  />

  <transactions-dialog
    :show="showTransactionDialog"
    @close="() => (showTransactionDialog = false)"
  />

  <cash-flow-dialog
    :show="showCashFlowDialog"
    @close="() => (showCashFlowDialog = false)"
  />

  <stocks-plan-dialog
    :show="showStockPlanDialog"
    @close="() => (showStockPlanDialog = false)"
  />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import PortfolioDialog from 'components/portfolio/PortfolioDialog.vue';
import TransactionsDialog from 'components/transactions/TransactionDialog.vue';
import CashFlowDialog from 'components/portfolio/CashFlowDialog.vue';
import StocksPlanDialog from 'components/stocksPlan/StocksPlanDialog.vue';
import { QFabProps, useQuasar } from 'quasar';

export default defineComponent({
  name: 'QuickAdd',
  components: { StocksPlanDialog, CashFlowDialog, TransactionsDialog, PortfolioDialog },
  setup() {
    const $q = useQuasar();

    const showPortfolioDialog = ref(false);
    const showTransactionDialog = ref(false);
    const showCashFlowDialog = ref(false);
    const showStockPlanDialog = ref(false);

    const isMobile = $q.platform.is.mobile;

    const mainFabProp = {
      color: isMobile ? 'white' : 'primary',
      direction: isMobile ? 'down' : 'up',
      flat: isMobile,
      square: isMobile
    } as QFabProps;

    return {
      mainFabProp,
      showPortfolioDialog,
      showTransactionDialog,
      showCashFlowDialog,
      showStockPlanDialog
    };
  },
});
</script>
