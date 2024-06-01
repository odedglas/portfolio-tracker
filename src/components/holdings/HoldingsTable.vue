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
          :props="props"
        >
          {{ props.row.totalValue.value }}
        </q-td>
        <q-td key="total_profit" :props="props">
          <div class="flex column" :class="props.row.profit.textClass">
            <span
              ><q-icon :name="props.row.profit.icon" size="sm" />{{
                props.row.profit.percent
              }}</span
            >
            <span>{{ props.row.profit.value }}</span>
          </div>
        </q-td>
        <q-td key="daily_change" :props="props">
          {{props.row.daily}}
        </q-td>
      </q-tr>
    </template>

    <template v-slot:bottom-row>
      <q-tr class="text-bold text-center" v-if="viewHoldings.length">
        <q-td colspan="1">
          <span>Total</span>
        </q-td>
        <q-td colspan="1">
          {{ totalSummary.shares }}
        </q-td>
        <q-td colspan="1"></q-td>
        <q-td
          v-if="totalSummary.currentValue"
          colspan="1"
          :class="`${totalSummary.currentValue > 0 ? 'text-green-5' : 'text-red-5'}`"
        >{{ $n(totalSummary.currentValue, 'decimal') }}</q-td
        >
        <q-td
          v-if="totalSummary.profit"
          colspan="1"
          :class="`${totalSummary.profit > 0 ? 'text-green-5' : 'text-red-5'}`"
          >{{ $n(totalSummary.profit, 'decimal') }}</q-td
        >
        <q-td colspan="1"/>
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
import { columns } from './columns';

export default defineComponent({
  name: 'HoldingsTable',
  setup() {
    const $n = useI18n().n;
    const filter = ref('');
    const holdingsStore = useHoldingsStore();

    const { holdingsWithProfits } = storeToRefs(holdingsStore);

    const viewHoldings = computed(() =>
      holdingsWithProfits.value.map((holding) => {
        const totalValue = holding.currentValue;
        const profitValue = holding.profit

        return {
          ...holding,
          totalValue: {
            value: $n(totalValue, 'decimal'),
            textClass: totalValue >= 0 ? 'text-green-6' : 'text-red-6',
          },
          profit: {
            value: profitValue ? $n(profitValue, 'decimal') : undefined,
            textClass: profitValue >= 0 ? 'text-green-6' : 'text-red-6',
            percent: totalValue > 0 ? $n(Math.abs(profitValue / totalValue), 'percent') : 0,
            icon: profitValue >= 0 ? 'arrow_drop_up' : 'arrow_drop_down',
          },
          daily: 2,
        };
      })
    );

    const isEmpty = computed(() => viewHoldings.value.length === 0);

    const totalSummary = computed(() =>
      holdingsWithProfits.value.reduce((acc, holding) => {
        acc.shares += holding.shares
        acc.profit += holding.profit
        acc.currentValue += holding.currentValue

        return acc;
      }, {
        shares: 0,
        profit: 0,
        currentValue: 0
      })
    );
    return {
      isEmpty,
      filter,
      columns,
      viewHoldings,
      totalSummary,
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
