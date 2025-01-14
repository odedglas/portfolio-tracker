<template>
  <q-btn flat icon="refresh" @click="refresh">
    <q-tooltip>Refresh finance data</q-tooltip>
  </q-btn>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useQuotesStore } from 'stores/quotes';
import { useLoadingStore } from 'stores/loading';

export default defineComponent({
  name: 'RefreshFinanceDataButton',
  setup: function () {
    const loadingStore = useLoadingStore();
    const quotesStore = useQuotesStore();

    const refresh = () =>
      loadingStore.emitLoadingTask(quotesStore.refreshQuotes);

    return {
      refresh,
    };
  },
});
</script>

<style lang="scss">
.alerts-icon {
  .q-badge.q-badge--floating {
    top: -2px;
    font-size: 10px;
    line-height: 10px;
    min-height: 10px;
  }
}
</style>
