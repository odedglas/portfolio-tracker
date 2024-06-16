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
        <div
          class="transactions-summary q-px-md q-py-xs rounded-borders"
          v-if="!isEmpty"
        >
          <div class="row" style="gap: 24px">
            <div
              class="col column flex justify-center"
              v-for="[keyName, value] in Object.entries(summary)"
              :key="keyName"
            >
              <span class="flex no-wrap items-center text-grey-8">
                <span
                  :class="`summary-indicator text-weight-bold q-mr-sm ${summaryToClassMap[keyName]}`"
                  >•</span
                >
                {{ $t(`transactions.${keyName}`) }}
              </span>
              <span class="text-center"> {{ $n(value, 'decimal') }}</span>
            </div>
          </div>
        </div>
        <q-input
          dense
          debounce="300"
          v-model="filter"
          placeholder="Search"
          v-if="!isEmpty"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </template>

    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td key="action" :props="props" :class="props.row.actionTextClass">
          <span class="text-capitalize text-bold">{{ props.row.action }}</span>
        </q-td>
        <q-td key="holdings_name" :props="props">
          <div class="row items-center">
            <ticker-logo
              :ticker="props.row.ticker"
              :logoImage="props.row.logoImage"
            />
            <div class="column q-ml-sm">
              <span class="text-body2">{{ props.row.name }}</span>
              <span class="text-uppercase text-grey-7">{{
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
        <q-td
          key="totalValue"
          :class="`${props.row.totalValue.textClass} text-bold`"
          :props="props"
        >
          {{ props.row.totalValue.sign }}{{ props.row.totalValue.value }}
        </q-td>
        <q-td key="total_profit" :props="props">
          <div
            v-if="props.row.profit.value && props.row.actualShares > 0"
            class="flex column"
            :class="props.row.profit.textClass"
          >
            <span
              ><q-icon :name="props.row.profit.icon" size="sm" />{{
                props.row.profit.percent
              }}</span
            >
            <span>{{ props.row.profit.value }}</span>
          </div>
          <span v-else>
            --
            <q-tooltip>
              <span>{{ $t('transactions.all_profit_is_realized') }}</span>
            </q-tooltip>
          </span>
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

    <template v-slot:bottom-row>
      <q-tr class="text-bold text-center" v-if="viewTransactions.length">
        <q-td colspan="1" class="text-left">
          <span>Total</span>
        </q-td>
        <q-td colspan="2" />
        <q-td colspan="1">
          {{ actualShares }}
        </q-td>
        <q-td colspan="3"></q-td>
        <q-td
          v-if="totalProfit"
          colspan="1"
          :class="`${totalProfit > 0 ? 'text-green-5' : 'text-red-5'}`"
          >{{ $n(totalProfit, 'decimal') }}</q-td
        >
        <td colspan="2" />
      </q-tr>
    </template>

    <template v-slot:no-data>
      <div class="full-width column flex-center text-grey-7 q-gutter-sm">
        <img src="~assets/no-results.png" alt="no-results" height="200" />
        <span>
          {{ $t('transactions.no_transactions_found') }}
        </span>
        <q-btn
          flat
          class="add-transaction"
          icon="add"
          @click="() => showOrEditTransaction()"
          color="secondary"
          :label="$t('transactions.add_your_first')"
        />
      </div>
    </template>
  </q-table>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { date } from 'quasar';
import { storeToRefs } from 'pinia';
import TickerLogo from 'components/common/TickerLogo.vue';
import { useTransactionsStore } from 'src/stores/transactions';
import { transformer } from 'src/service/transactions';
import { Transaction } from 'src/types';
import { columns } from './columns';

export default defineComponent({
  name: 'TransactionsTable',
  components: {
    TickerLogo,
  },
  props: {
    showOrEditTransaction: {
      required: true,
      type: Function as PropType<(transaction?: Transaction) => void>,
    },
  },
  emit: ['deleteTransaction', 'editTransaction'],
  setup() {
    const $n = useI18n().n;
    const filter = ref('');
    const transactionsStore = useTransactionsStore();

    const { transactions, summary, balanceMap, actualShares } =
      storeToRefs(transactionsStore);

    const viewTransactions = computed(() =>
      transactions.value.map((transaction) => {
        const isBuyAction = transformer.isBuy(transaction);
        const profitValue = balanceMap.value[transaction.id] ?? 0;
        const transactionValue = transformer.totalValue(transaction);

        return {
          ...transaction,
          actionTextClass: isBuyAction ? 'text-green-4' : 'text-red-4',
          totalValue: {
            value: $n(transactionValue, 'decimal'),
            textClass: isBuyAction ? 'text-red-6' : 'text-green-6',
            sign: isBuyAction ? '-' : '+',
          },
          price: transaction.price,
          date: date.formatDate(transaction.date, 'MM/DD/YY'),
          profit: {
            value: profitValue ? $n(profitValue, 'decimal') : undefined,
            textClass: profitValue >= 0 ? 'text-green-6' : 'text-red-6',
            percent: $n(
              transformer.profitPercent(profitValue, transaction),
              'percent'
            ),
            icon: profitValue >= 0 ? 'arrow_drop_up' : 'arrow_drop_down',
          },
        };
      })
    );

    const totalProfit = computed(() =>
      viewTransactions.value.reduce((acc, transaction) => {
        const profitValue = balanceMap.value[transaction.id] ?? 0;
        return acc + profitValue;
      }, 0)
    );

    const isEmpty = computed(() => transactions.value.length === 0);

    const summaryToClassMap = {
      buy: 'text-green-6',
      sell: 'text-red-6',
      fees: 'text-purple-6',
    } as Record<string, string>;

    const matchToViewTransaction = <T extends Transaction>(
      viewTransaction: T
    ) =>
      transactions.value.find(
        (transaction) => transaction.id === viewTransaction.id
      );

    return {
      isEmpty,
      filter,
      columns,
      matchToViewTransaction,
      viewTransactions,
      summary,
      summaryToClassMap,
      actualShares,
      totalProfit,
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

  .transactions-summary {
    border: 1px solid $grey-4;

    .summary-indicator {
      font-size: 1.25em;
    }
  }
}
</style>
