<template>
  <q-table
    v-if="allocationPlans.length"
    :rows="allocationPlans"
    :columns="columns"
    hide-pagination
    flat
    bordered
    row-key="id"
    :rows-per-page-options="[100]"
  >
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td key="ticker" :props="props">
          <span class="flex items-center q-gap-md">
            <ticker-logo
              :ticker="props.row.ticker"
              :logo-image="props.row.logoImage"
            />
            <span> {{ props.row.name }}</span>
          </span>
        </q-td>
        <q-td key="shares_amount" :props="props">
          {{ $n(props.row.shares, 'fixedSensitive') }}
        </q-td>
        <q-td key="target_price" :props="props">
          {{ $n(props.row.targetPrice, 'decimal') }}
        </q-td>
        <q-td key="usage" :props="props">
          {{ $n(props.row.allocationUsage, 'percent') }}
        </q-td>
        <q-td key="total" :props="props">
          {{ $n(props.row.totalValue, 'decimal') }}
        </q-td>
        <q-td key="item_actions" :props="props">
          <div class="text-grey-8 q-gutter-xs">
            <q-btn
              class="gt-xs"
              size="12px"
              flat
              dense
              round
              icon="edit"
              @click.stop="$emit('open-entity-modal', props.row)"
            />
            <q-btn
              size="12px"
              flat
              dense
              round
              icon="delete"
              @click.stop="$emit('delete-entity', props.row)"
            >
            </q-btn>
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useAllocationPlansStore } from 'stores/allocationPlans';
import TickerLogo from 'components/common/TickerLogo.vue';
import { columns } from './columns';

export default defineComponent({
  name: 'AllocationsPlannerTable',
  components: { TickerLogo },
  emits: ['open-entity-modal', 'delete-entity'],
  setup() {
    const allocationsPlansStore = useAllocationPlansStore();

    const allocationPlans = computed(() => allocationsPlansStore.plans);

    return {
      allocationPlans,
      columns,
    };
  },
});
</script>
