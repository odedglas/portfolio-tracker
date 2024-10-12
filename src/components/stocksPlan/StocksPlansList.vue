<template>
  <div class="rounded-borders q-card--bordered">
    <q-table
      :rows="plans"
      class="plans-table"
      :columns="columns"
      hide-pagination
      flat
      row-key="grant_name"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="grant_name" :props="props">
            <div class="row items-center">
              <div class="column q-ml-sm">
                <span class="text-body2">{{ props.row.identifier }}</span>
              </div>
            </div>
          </q-td>
          <q-td key="grant_date" :props="props">
            {{ formatDate(props.row.grantDate) }}
          </q-td>
          <q-td key="grant_price" :props="props">
            {{ $n(props.row.grantPrice, 'decimal') }}
          </q-td>
          <q-td key="type" class="text-uppercase" :props="props">
            {{ props.row.type }}
          </q-td>
          <q-td key="amount" :props="props">
            {{ $n(props.row.amount, 'fixed') }}
          </q-td>
          <q-td key="vested" :props="props">
            {{ $n(props.row.vested ?? 0, 'fixed') }}
          </q-td>
          <q-td key="next_vesting" :props="props">
            {{
              !props.row.terminationDate && props.row.nextVesting
                ? formatDate(props.row.nextVesting)
                : '---'
            }}
          </q-td>
          <q-td key="last_vested" :props="props">
            {{
              props.row.terminationDate && props.row.lastVested
                ? formatDate(props.row.lastVested)
                : '---'
            }}
          </q-td>
          <q-td key="sellable_value" :props="props">
            {{ $n(props.row.sellableValue, 'decimal') }}
          </q-td>
          <q-td key="total_value" :props="props">
            {{ $n(props.row.potentialValue, 'decimal') }}
          </q-td>
          <q-td key="item_actions" :props="props"> ACTIONS </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script lang="ts">
import { date as DateAPI } from 'quasar';
import { defineComponent, PropType } from 'vue';
import { StocksPlan } from 'app/shared/types';
import { columns } from './columns';

export default defineComponent({
  name: 'StocksPlansList',
  props: {
    plans: {
      type: Object as PropType<StocksPlan[]>,
      required: true,
    },
  },
  setup() {
    const formatDate = (date: number) => {
      return DateAPI.formatDate(date, 'DD MMM YYYY');
    };

    return {
      columns,
      formatDate,
    };
  },
});
</script>

<style lang="scss">
.plans-table {
  .q-table th {
    font-size: 14px;
    color: $grey-6;
  }

  .q-table td {
    font-size: 14px;
  }
}
</style>
