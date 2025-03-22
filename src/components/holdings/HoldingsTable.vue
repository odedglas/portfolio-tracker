<template>
  <q-table
    :rows="viewHoldings"
    class="holdings-table"
    :columns="columns"
    row-key="name"
    :filter="filter"
    :rows-per-page-options="[0]"
  >
    <template v-slot:body="props">
      <q-tr :props="props">
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
        <q-td key="shares" :props="props">
          {{ props.row.shares }}
        </q-td>
        <q-td key="avg_price" :props="props">
          {{ $n(props.row.avgPrice, 'decimal') }}
        </q-td>
        <q-td key="invested" :props="props">
          {{ $n(props.row.invested, 'decimal') }}
        </q-td>
        <q-td key="total_value" :props="props">
          {{ $n(props.row.totalValue, 'decimal') }}
        </q-td>
        <q-td key="total_profit" :props="props">
          <profit-indicator
            :percentage="props.row.profit.percent"
            :realized-value="props.row.realizedProfits"
            :value="props.row.profit.value"
            :display-as-row="false"
          />
        </q-td>
        <q-td key="daily_change" :props="props">
          <profit-indicator
            :percentage="props.row.daily.percent"
            :value="props.row.daily.value"
            :display-as-row="false"
          />
        </q-td>
      </q-tr>
    </template>

    <template v-slot:bottom-row>
      <q-tr class="text-bold text-center" v-if="viewHoldings.length">
        <q-td colspan="1" class="text-left">
          <span>Total</span>
        </q-td>
        <q-td colspan="1">
          {{ summary.shares }}
        </q-td>
        <q-td colspan="1"></q-td>
        <q-td v-if="summary.invested" colspan="1">{{
          $n(summary.invested, 'decimal')
        }}</q-td>
        <q-td v-if="summary.currentValue" colspan="1">{{
          $n(summary.currentValue, 'decimal')
        }}</q-td>
        <q-td
          v-if="summary.profit"
          colspan="1"
          :class="`${summary.profit > 0 ? 'text-green-5' : 'text-red-5'}`"
          >{{ $n(summary.profit, 'decimal') }}</q-td
        >
        <q-td
          colspan="1"
          v-if="summary.dailyChange"
          :class="`${summary.dailyChange > 0 ? 'text-green-5' : 'text-red-5'}`"
          >{{ $n(summary.dailyChange, 'decimal') }}</q-td
        >
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
import { defineComponent, ref } from 'vue';
import { storeToRefs } from 'pinia';
import TickerLogo from 'components/common/TickerLogo.vue';
import { useHoldingsStore } from 'src/stores/holdings';
import { columns } from './columns';
import ProfitIndicator from 'components/common/ProfitIndicator.vue';
import { useViewHoldings } from 'components/composables/useViewHoldings';

export default defineComponent({
  name: 'HoldingsTable',
  components: {
    ProfitIndicator,
    TickerLogo,
  },
  setup() {
    const filter = ref('');
    const holdingsStore = useHoldingsStore();

    const { summary } = storeToRefs(holdingsStore);

    const { viewHoldings } = useViewHoldings();

    return {
      filter,
      columns,
      viewHoldings,
      summary,
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
