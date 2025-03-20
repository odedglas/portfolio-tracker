<template>
  <q-card>
    <q-card-section>
      <q-table
        :rows="balanceItems"
        :columns="columns"
        row-key="date"
        flat
        :rows-per-page-options="[0]"
      >
        <template v-slot:body-cell-type="props">
          <q-td :props="props">
            <q-chip
              :color="getTypeColor(props.row.type)"
              outline
              text-color="white"
              class="text-uppercase"
              size="sm"
            >
              {{ props.row.type.toLowerCase() }}
            </q-chip>
          </q-td>
        </template>
        <template v-slot:body-cell-value="props">
          <q-td :props="props">
            <span
              :class="{
                'text-red-8': props.row.value < 0,
                'text-green-8': props.row.value > 0,
              }"
            >
              {{ $n(props.row.value, 'currency') }}
            </span>
          </q-td>
        </template>
        <template v-slot:body-cell-balance="props">
          <q-td :props="props" class="text-bold">
            {{ $n(props.row.balance, 'currency') }}
          </q-td>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { usePortfolioStore } from 'stores/portfolios';
import { Transaction, Deposit } from 'app/shared/types';
import { useTransactionsStore } from 'stores/transactions';
import { columns } from './columns';
import { transactionsTransformer } from 'app/shared/transformers';

interface BalanceHistoryItem {
  date: number;
  type: 'BUY' | 'SELL' | 'DEPOSIT' | 'WITHDRAWAL' | 'BALANCE';
  description: string;
  value: number;
  balance?: number;
}

export default defineComponent({
  name: 'BalanceHistory',
  setup() {
    const portfolioStore = usePortfolioStore();
    const transactionsStore = useTransactionsStore();

    const balanceItems = computed(() => {
      const items: BalanceHistoryItem[] = [];
      let totalBalance = 0;

      // Combine transactions and deposits
      const relatedRecords = [
        ...(portfolioStore.selectedPortfolio?.deposits.map((d: Deposit) => {
          const isWithdrawal = d.type === 'withdrawal';
          return {
            date: d.date,
            type: d.type.toUpperCase(),
            description: d.notes ?? `Cash ${d.type}`,
            value: isWithdrawal ? -d.value : d.value,
          };
        }) ?? []),
        ...(transactionsStore.transactions || []).map((t: Transaction) => ({
          date: t.date,
          type: t.action.toUpperCase() as 'BUY' | 'SELL',
          description: `${t.action} ${t.shares} shares of ${t.ticker}`,
          value:
            transactionsTransformer.totalValue(t) *
            (transactionsTransformer.isBuy(t) ? -1 : 1),
        })),
      ] as BalanceHistoryItem[];

      relatedRecords
        .sort((a, b) => (a.date > b.date ? 1 : -1))
        .forEach((item) => {
          totalBalance += item.value;
          items.push({
            date: item.date,
            type: item.type,
            description: item.description,
            value: item.value,
            balance: totalBalance,
          });
        });

      return items.reverse();
    });

    const getTypeColor = (type: BalanceHistoryItem['type']) => {
      switch (type) {
        case 'BUY':
          return 'teal-8';
        case 'SELL':
          return 'red-8';
        case 'DEPOSIT':
          return 'green-9';
        case 'WITHDRAWAL':
          return 'warning';
        default:
          return 'grey';
      }
    };

    return {
      columns,
      balanceItems,
      getTypeColor,
    };
  },
});
</script>
