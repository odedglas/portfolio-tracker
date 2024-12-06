<template>
  <div class="rounded-borders q-card--bordered">
    <q-table
      :rows="plans"
      class="plans-table"
      :columns="columns"
      hide-pagination
      flat
      row-key="identifier"
      :rows-per-page-options="[100]"
    >
      <template v-slot:body="props">
        <q-tr
          :props="props"
          class="clickable"
          @click="props.expand = !props.expand"
        >
          <q-td key="row_expand" auto-width>
            <q-btn
              size="md"
              round
              dense
              flat
              :class="`expand-icon ${props.expand ? 'expanded' : ''}`"
              icon="expand_more"
            />
          </q-td>
          <q-td key="grant_name" :props="props">
            <div class="row items-center">
              <div class="column q-ml-sm">
                <span class="text-body2">{{ props.row.identifier }}</span>
              </div>
            </div>
          </q-td>
          <q-td key="grant_date" :props="props">
            {{ formatPlanDate(props.row.grantDate) }}
          </q-td>
          <q-td key="grant_price" :props="props">
            {{ $n(props.row.grantPrice, 'decimal') }}
          </q-td>
          <q-td key="type" class="text-uppercase" :props="props">
            {{ props.row.type }}
          </q-td>
          <q-td key="amount" :props="props">
            {{ $n(props.row.amount, 'fixedSensitive') }}
          </q-td>
          <q-td key="sold_shares" :props="props">
            {{ $n(props.row.soldShares, 'fixedSensitive') }}
          </q-td>
          <q-td key="vested" :props="props">
            {{ $n(props.row.vested ?? 0, 'fixedSensitive') }}
          </q-td>
          <q-td key="last_vested" :props="props">
            {{ getLastVestedText(props.row) }}
          </q-td>
          <q-td key="next_vesting" :props="props">
            {{ getNextVestingText(props.row) }}
          </q-td>
          <q-td key="sellable_value" :props="props">
            {{ $n(props.row.sellableValue, 'decimal') }}
          </q-td>
          <q-td key="total_value" :props="props">
            {{ $n(props.row.potentialValue ?? 0, 'currency') }}
          </q-td>
          <q-td key="item_actions" :props="props">
            <div class="text-grey-8 q-gutter-xs">
              <q-btn
                class="gt-xs"
                size="12px"
                flat
                dense
                round
                :disable="props.row.availableShares === 0"
                icon="calculate"
                @click.stop="() => $emit('simulate-plan', props.row)"
              />
              <q-btn
                class="gt-xs"
                size="12px"
                flat
                dense
                round
                icon="edit"
                @click.stop="() => $emit('edit-plan', props.row)"
              />
              <q-btn
                size="12px"
                flat
                dense
                round
                icon="delete"
                @click.stop="() => $emit('delete-plan', props.row)"
              >
              </q-btn>
            </div>
          </q-td>
        </q-tr>
        <q-tr v-if="props.expand" :props="props">
          <q-td colspan="100%" class="expanded-cell">
            <stocks-plan-extended-details :plan="props.row" />
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { StocksPlan } from 'app/shared/types';
import { formatPlanDate } from 'src/service/date';
import { columns } from './columns';
import StocksPlanExtendedDetails from 'components/stocksPlan/StocksPlanExtendedDetails.vue';

export default defineComponent({
  name: 'StocksPlansList',
  components: { StocksPlanExtendedDetails },
  emits: ['delete-plan', 'edit-plan', 'simulate-plan'],
  props: {
    plans: {
      type: Object as PropType<StocksPlan[]>,
      required: true,
    },
  },
  setup() {
    const getNextVestingText = ({
      vested,
      amount,
      terminationDate,
      nextVesting,
      type,
    }: StocksPlan) => {
      if (type === 'espp') {
        return '----';
      }

      if (amount === vested) {
        return 'Fully vested';
      }

      if (terminationDate) {
        return 'Terminated Plan';
      }

      return nextVesting ? formatPlanDate(nextVesting) : '---';
    };

    const getLastVestedText = ({
      grantDate,
      vestingEndDate,
      lastVested,
    }: StocksPlan) => {
      if (grantDate === vestingEndDate) {
        return formatPlanDate(grantDate);
      }

      if (lastVested) {
        return formatPlanDate(lastVested);
      }

      return '---';
    };

    return {
      columns,
      formatPlanDate,
      getNextVestingText,
      getLastVestedText,
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

  .expand-icon {
    transition: all 0.2s ease;
    transform: rotate(0);

    &.expanded {
      transform: rotate(180deg);
    }
  }

  .expanded-cell {
    &:before {
      background: transparent;
    }
  }
}
</style>
