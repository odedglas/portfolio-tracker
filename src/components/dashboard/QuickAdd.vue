<template>
  <q-page-sticky position="bottom-right" :offset="[30, 40]">
    <q-fab
      color="primary"
      class="dashboard-quick-add"
      icon="add"
      direction="up"
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
    </q-fab>

    <portfolio-dialog
      :show="showPortfolioDialog"
      @close-portfolio="() => (showPortfolioDialog = false)"
    />

    <transactions-dialog
      :show="showTransactionDialog"
      @close="() => (showTransactionDialog = false)"
    />
  </q-page-sticky>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import PortfolioDialog from 'components/portfolio/PortfolioDialog.vue';
import TransactionsDialog from 'components/transactions/TransactionDialog.vue';

export default defineComponent({
  name: 'QuickAdd',
  components: { TransactionsDialog, PortfolioDialog },
  setup() {
    const showPortfolioDialog = ref(false);
    const showTransactionDialog = ref(false);
    return {
      showPortfolioDialog,
      showTransactionDialog,
    };
  },
});
</script>
