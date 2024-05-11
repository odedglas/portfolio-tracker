<template>
  <q-page class="row justify-center q-pa-md">
    <div class="col-11">
      <p class="text-h5 text-grey-7">{{ $t('transactions.header') }}</p>
      <transactions-table />
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TransactionsTable from 'src/components/transactions/TransactionsTable.vue';

export default defineComponent({
  name: 'TransactionsPage',
  components: {
    TransactionsTable,
  },
});
</script>
