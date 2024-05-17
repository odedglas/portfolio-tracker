<template>
  <q-table
    :rows="viewTransactions"
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
          @click="() => showOrEditTransaction()"
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
            <div class="empty-logo-alt flex items-center justify-center" v-else>
              <span class="ticker">{{ props.row.ticker }}</span>
            </div>
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
        <q-td key="item_actions" :props="props" class="text-grey-6">
          <q-btn
            class="gt-xs"
            size="12px"
            flat
            dense
            round
            icon="edit"
            @click="
              () => $emit('editTransaction', matchToViewTransaction(props.row))
            "
          />
          <q-btn
            size="12px"
            flat
            dense
            round
            icon="delete"
            @click="
              () =>
                $emit('deleteTransaction', matchToViewTransaction(props.row))
            "
          >
          </q-btn>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { date } from 'quasar';
import { Transaction } from 'src/types';
import { TRANSACTIONS_TYPES } from 'src/constants';
import { columns } from './columns';

export default defineComponent({
  name: 'TransactionsTable',
  props: {
    showOrEditTransaction: {
      required: true,
      type: Function as PropType<(transaction?: Transaction) => void>,
    },
    transactions: {
      required: true,
      type: Object as PropType<Transaction[]>,
    },
  },
  emit: ['deleteTransaction', 'editTransaction'],
  setup(props) {
    const $n = useI18n().n;
    const filter = ref('');

    const viewTransactions = computed(() =>
      props.transactions.map((transaction) => {
        const isBuyAction = transaction.action === TRANSACTIONS_TYPES.BUY;

        return {
          ...transaction,
          actionTextClass: isBuyAction ? 'text-green-4' : 'text-red-4',
          balance: {
            value: $n(
              transaction.shares * transaction.price - (transaction.fees || 0),
              'currency'
            ),
            textClass: isBuyAction ? 'text-red-7' : 'text-green-7',
            sign: isBuyAction ? '-' : '+',
          },
          price: transaction.price,
          date: date.formatDate(transaction.date, 'MM/DD/YY'),
          profit: '--Missing--', // TODO - Need to calculate it base on action type and current value.
        };
      })
    );

    const matchToViewTransaction = <T extends Transaction>(
      viewTransaction: T
    ) => {
      debugger;
      return props.transactions.find(
        (transaction) => transaction.id === viewTransaction.id
      );
    };

    return {
      filter,
      columns,
      matchToViewTransaction,
      viewTransactions,
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
