<template>
  <q-table
    :rows="viewHoldings"
    class="holdings-table"
    :columns="columns"
    row-key="name"
    :filter="filter"
    :rows-per-page-options="[10, 15, 25, 0]"
  >
    <template v-slot:body="props">
      <q-tr :props="props">
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
        <q-td key="shares" :props="props">
          {{ props.row.shares }}
        </q-td>
        <q-td key="avg_price" :props="props">
          {{ $n(props.row.avgPrice, 'decimal') }}
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
            class="flex column"
            :class="props.row.profit.textClass"
          >
            <span
              ><q-icon :name="props.row.profit.icon" size="sm" />{{
                props.row.profit.percent
              }}</span
            >
            <span class="text-grey-8">{{ props.row.profit.value }}</span>
          </div>
        </q-td>
      </q-tr>
    </template>

    <template v-slot:bottom-row>
      <q-tr class="text-bold text-center">
        <q-td colspan="3">
          <span>Total</span>
        </q-td>
        <q-td colspan="1">
          {{ totalShares }}
        </q-td>
        <q-td colspan="3"></q-td>
        <q-td
          v-if="total.profit"
          colspan="1"
          :class="`${total.profit > 0 ? 'text-green-5' : 'text-red-5'}`"
          >{{ $n(total.profit, 'decimal') }}</q-td
        >
        <td colspan="1" />
      </q-tr>
    </template>

    <template v-slot:no-data>
      <div class="full-width column flex-center text-grey-7 q-gutter-sm">
        <img src="~assets/no-results.png" alt="no-results" height="200" />
        <span>
          {{ $t('holdings.no_holdings') }}
        </span>
        <q-btn
          flat
          class="add-transaction"
          icon="add"
          color="secondary"
          :label="$t('transactions.add_your_first')"
        />
      </div>
    </template>
  </q-table>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useHoldingsStore } from 'src/stores/holdings';
import { useTransactionsStore } from 'stores/transactions';
import { columns } from './columns';

export default defineComponent({
  name: 'HoldingsTable',
  setup() {
    const $n = useI18n().n;
    const filter = ref('');
    const holdingsStore = useHoldingsStore();
    const transactionsStore = useTransactionsStore();

    const { holdings, total } =
      storeToRefs(holdingsStore);

    const viewHoldings = computed(() =>
      holdings.value.map((holding) => {
        const lastTickerValue = transactionsStore.tickerQuotes[holding.ticker];

        const totalValue = holding.shares * lastTickerValue.regularMarketPrice;
        const avgCost = holding.shares * holding.avgPrice;

        const profitValue = totalValue - avgCost;

        return {
          ...holding,
          totalValue: {
            value: $n(totalValue, 'decimal'),
            textClass: totalValue >= 0 ? 'text-red-6' : 'text-green-6',
            sign: totalValue ? (totalValue > 0 ? '-' : '+') : '',
          },
          profit: {
            value: profitValue ? $n(profitValue, 'decimal') : undefined,
            textClass: profitValue >= 0 ? 'text-green-6' : 'text-red-6',
            percent: $n(Math.abs(profitValue / totalValue), 'percent'),
            icon: profitValue >= 0 ? 'arrow_drop_up' : 'arrow_drop_down',
          },
        };
      })
    );

    const isEmpty = computed(() => holdings.value.length === 0);

    const totalShares = computed(() => holdings.value.reduce((acc, holding) => acc + holding.shares, 0));

    return {
      isEmpty,
      filter,
      columns,
      viewHoldings,
      total,
      totalShares,
    };
  },
});
</script>

<style lang="scss">
.holdings-table {
  .q-table th {
    font-size: 14px;
    color: $grey-6;
  }

  .q-table td {
    font-size: 14px;
  }
}
</style>
