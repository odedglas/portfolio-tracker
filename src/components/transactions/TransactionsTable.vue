<template>
  <q-table
    :rows="rows"
    :columns="columns"
    row-key="name"
    :filter="filter"
    :rows-per-page-options="[10, 15, 25, 0]"
  >
    <template v-slot:top>
      <div class="flex items-center justify-between col">
        <q-btn
          outline
          class="add-transaction"
          icon="add"
          color="primary"
          :label="$t('add')"
        />
        <span>Transactions Summary goes here</span>
        <q-input dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </template>
  </q-table>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import type { QTableProps } from 'quasar';
import { Transaction } from 'src/types';
import { TRANSACTIONS_TYPES } from 'src/constants';

const columns: QTableProps['columns'] = [
  {
    name: 'name',
    required: true,
    label: 'Dessert (100g serving)',
    field: 'name',
    sortable: false,
    align: 'left',
  },
  {
    name: 'calories',
    align: 'center',
    label: 'Calories',
    field: 'calories',
    sortable: true,
  },
  {
    name: 'fat',
    align: 'center',
    label: 'Fat (g)',
    field: 'fat',
    sortable: true,
  },
  { name: 'carbs', align: 'center', label: 'Carbs (g)', field: 'carbs' },
  { name: 'protein', align: 'center', label: 'Protein (g)', field: 'protein' },
  { name: 'sodium', align: 'center', label: 'Sodium (mg)', field: 'sodium' },
];

const transactions: Transaction[] = [
  {
    id: 'my-portfolio',
    ticker: 'MSTR',
    balanceChange: 500,
    action: TRANSACTIONS_TYPES.SELL,
    shares: 10,
    fees: 7.5,
    price: 300,
    date: Date.now(),
  },
  {
    id: 'my-portfolio',
    ticker: 'FVRR',
    balanceChange: -250,
    action: TRANSACTIONS_TYPES.BUY,
    shares: 33,
    fees: 7.5,
    price: 100,
    date: Date.now(),
  },
];

const rows = [
  {
    name: 'Frozen Yogurt',
    calories: 159,
    fat: 6.0,
    carbs: 24,
    protein: 4.0,
    sodium: 87,
    calcium: '14%',
    iron: '1%',
  },
  {
    name: 'Ice cream sandwich',
    calories: 237,
    fat: 9.0,
    carbs: 37,
    protein: 4.3,
    sodium: 129,
    calcium: '8%',
    iron: '1%',
  },
  {
    name: 'Eclair',
    calories: 262,
    fat: 16.0,
    carbs: 23,
    protein: 6.0,
    sodium: 337,
    calcium: '6%',
    iron: '7%',
  },
  {
    name: 'Cupcake',
    calories: 305,
    fat: 3.7,
    carbs: 67,
    protein: 4.3,
    sodium: 413,
    calcium: '3%',
    iron: '8%',
  },
  {
    name: 'Gingerbread',
    calories: 356,
    fat: 16.0,
    carbs: 49,
    protein: 3.9,
    sodium: 327,
    calcium: '7%',
    iron: '16%',
  },
  {
    name: 'Jelly bean',
    calories: 375,
    fat: 0.0,
    carbs: 94,
    protein: 0.0,
    sodium: 50,
    calcium: '0%',
    iron: '0%',
  },
  {
    name: 'Lollipop',
    calories: 392,
    fat: 0.2,
    carbs: 98,
    protein: 0,
    sodium: 38,
    calcium: '0%',
    iron: '2%',
  },
  {
    name: 'Honeycomb',
    calories: 408,
    fat: 3.2,
    carbs: 87,
    protein: 6.5,
    sodium: 562,
    calcium: '0%',
    iron: '45%',
  },
  {
    name: 'Donut',
    calories: 452,
    fat: 25.0,
    carbs: 51,
    protein: 4.9,
    sodium: 326,
    calcium: '2%',
    iron: '22%',
  },
  {
    name: 'KitKat',
    calories: 518,
    fat: 26.0,
    carbs: 65,
    protein: 7,
    sodium: 54,
    calcium: '12%',
    iron: '6%',
  },
];

export default defineComponent({
  name: 'TransactionsTable',
  setup() {
    const filter = ref('');

    return {
      filter,
      columns,
      rows,
    };
  },
});
</script>

<style lang="scss">
.add-transaction {
  .q-icon {
    margin-right: 6px;
  }
}
</style>
