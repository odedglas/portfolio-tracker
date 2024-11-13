<template>
  <div class="col">
    <div class="row q-px-md items-center">
      <span
        :class="`text-caption ${header ? 'col' : 'col-1'}`"
        v-for="header in headers"
        :key="header"
      >
        {{ header }}</span
      >
    </div>
    <q-list class="plan-orders-list" bordered>
      <q-item
        v-for="order in planOrders"
        :key="order.date"
        class="row order-row"
      >
        <span class="col flex items-center">{{ order.id }}</span>
        <span class="col flex items-center">{{ order.date }}</span>
        <span class="col flex items-center">{{
          $n(order.shares, 'fixedSensitive')
        }}</span>
        <span class="col flex items-center">{{
          $n(order.price, 'decimal')
        }}</span>
        <span class="col flex items-center text-bold">{{
          $n(order.baseValue ?? 0, 'decimal')
        }}</span>
        <span class="col flex items-center text-bold">{{
          $n(order.totalValue ?? 0, 'decimal')
        }}</span>
        <span class="col flex items-center text-bold">{{
          $n(order.taxComponent ?? 0, 'decimal')
        }}</span>
        <span class="col flex items-center text-bold">{{
          $n(order.capitalGain ?? 0, 'decimal')
        }}</span>
        <span class="col flex items-center text-bold">{{
          $n(order.netGain ?? 0, 'decimal')
        }}</span>
        <div class="col-1 text-grey-7 flex justify-end">
          <q-btn
            size="12px"
            flat
            dense
            round
            @click.stop="() => $emit('delete-order', order)"
            icon="delete"
          />
        </div>
      </q-item>
    </q-list>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { formatPlanDate } from 'src/service/date';
import { StockPlanOrder } from 'app/shared/types';

export default defineComponent({
  name: 'StocksPlanOrdersList',
  emits: ['delete-order'],
  props: {
    orders: {
      type: Object as PropType<StockPlanOrder[]>,
      required: true,
    },
  },
  setup(props) {
    const headers = [
      'Identifier',
      'Date',
      'Amount',
      'Exercise Price',
      'Base Value',
      'Total Value',
      'Tax Component',
      'Captial Gain',
      'Net Gain',
      '',
    ];

    const planOrders = computed(() => {
      return props.orders.map((order) => ({
        ...order,
        date: formatPlanDate(order.date),
      }));
    });

    return {
      headers,
      planOrders,
    };
  },
});
</script>

<style lang="scss">
.plan-orders-list {
  max-height: 210px;
  min-width: 350px;
  overflow: scroll;

  .order-row {
    &:not(:last-child) {
      border-bottom: 1px solid $grey-4;
    }
  }
}
</style>
