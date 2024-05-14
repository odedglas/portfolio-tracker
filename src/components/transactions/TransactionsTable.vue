<template>
  <q-table
    :rows="transactions"
    class="transactions-table"
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

    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td key="action" :props="props" :class="props.row.actionTextClass">
          <span class="text-uppercase text-bold">{{ props.row.action }}</span>
        </q-td>
        <q-td key="holdings_name" :props="props">
          <div class="row items-center">
            <img
              v-if="props.row.logoImage"
              width="35"
              height="35"
              :src="props.row.logoImage"
              :alt="props.row.ticker"
            />
            <div class="column q-ml-sm">
              <span class="text-body2">{{ props.row.name }}</span>
              <span class="text-uppercase text-grey-6">{{
                props.row.ticker
              }}</span>
            </div>
          </div>
        </q-td>
        <q-td key="date" :props="props">
          {{ props.row.date }}
        </q-td>
        <q-td key="shares" :props="props">
          {{ props.row.shares }}
        </q-td>
        <q-td key="price" :props="props">
          {{ $n(props.row.price, 'decimal') }}
        </q-td>
        <q-td key="fees" :props="props">
          {{ props.row.fees ? $n(props.row.fees, 'decimal') : 'None' }}
        </q-td>
        <q-td key="balance" :class="props.row.balance.textClass" :props="props">
          {{ props.row.balance.sign }}{{ props.row.balance.value }}
        </q-td>
        <q-td key="total_profit" :props="props">
          {{ props.row.profit }}
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { date } from 'quasar';
import type { QTableProps } from 'quasar';
import { Transaction, TransactionAction } from 'src/types';
import { TRANSACTIONS_TYPES } from 'src/constants';

const columns: QTableProps['columns'] = [
  {
    name: 'action',
    field: 'action',
    label: 'Action',
    sortable: true,
    required: true,
    align: 'left',
  },
  {
    name: 'holdings_name',
    required: true,
    label: 'Holding Name',
    field: 'name',
    sortable: true,
    align: 'left',
  },
  {
    name: 'date',
    align: 'center',
    label: 'Date',
    field: 'date',
    sortable: true,
  },
  {
    name: 'shares',
    align: 'center',
    label: 'Shares',
    field: 'shares',
    sortable: true,
  },
  { name: 'price', align: 'center', label: 'Price', field: 'price' },
  { name: 'fees', align: 'center', label: 'Fees', field: 'fees' },
  {
    name: 'balance',
    align: 'center',
    label: 'Balance',
    field: 'balance',
  },
  { name: 'total_profit', align: 'center', label: 'Profit', field: 'profit' },
];

const transactions: Transaction[] = [
  {
    id: 'my-portfolio',
    ticker: 'MSTR',
    name: 'MicroStrategy Incorporated',
    action: TRANSACTIONS_TYPES.SELL,
    shares: 10,
    fees: 7.5,
    price: 300,
    date: Date.now(),
    logoImage: 'https://eodhd.com/img/logos/US/MSTR.png',
  },
  {
    id: 'my-portfolio',
    ticker: 'FVRR',
    name: 'Fiverr',
    action: TRANSACTIONS_TYPES.BUY,
    shares: 33,
    fees: 7.5,
    price: 100,
    date: Date.now(),
    logoImage: 'https://eodhd.com/img/logos/US/FVRR.png',
  },
];

export default defineComponent({
  name: 'TransactionsTable',
  setup() {
    const $n = useI18n().n;
    const filter = ref('');

    const actionTextColor = (action: TransactionAction) =>
      action == 'buy' ? 'text-green-4' : 'text-red-4';

    return {
      filter,
      columns,
      actionTextColor,
      transactions: transactions.map((transaction) => {
        const isBuyAction = transaction.action === 'buy';

        return {
          ...transaction,
          actionTextClass: isBuyAction ? 'text-green-4' : 'text-red-4',
          totalValue: $n(
            transaction.shares * transaction.price - transaction.fees || 0,
            'currency'
          ),
          balance: {
            value: $n(
              transaction.shares * transaction.price - transaction.fees || 0,
              'currency'
            ),
            textClass: isBuyAction ? 'text-red-7' : 'text-green-7',
            sign: isBuyAction ? '-' : '+',
          },
          price: transaction.price,
          date: date.formatDate(transaction.date, 'MM/DD/YY'),
          profit: '--Missing--', // TODO - Need to calculate it base on action type and current value.
        };
      }),
    };
  },
});
</script>

<style lang="scss">
.transactions-table {
  .add-transaction {
    .q-icon {
      margin-right: 6px;
    }
  }

  .q-table th {
    font-size: 14px;
    color: $grey-6;
  }

  .q-table td {
    font-size: 14px;
  }
}
</style>
