<template>
  <q-item-section avatar center class="text-grey-8">
    <q-icon name="business_center" size="28px" />
  </q-item-section>

  <q-item-section center class="col-2">
    <q-item-label class="text-subtitle1">{{ portfolio.title }}</q-item-label>
  </q-item-section>

  <q-item-section top>
    <q-list class="row">
      <q-separator spaced vertical />

      <q-item class="col-2">
        <q-item-section top class="items-center justify-between">
          <q-item-label class="text-grey-6">Current value</q-item-label>
          <q-item-label class="q-mt-md"
            >{{ portfolio.currentValue }}$</q-item-label
          >
        </q-item-section>
      </q-item>

      <q-separator spaced vertical />

      <q-item class="col-2">
        <q-item-section top class="items-center justify-between">
          <q-item-label class="text-grey-6">Profit</q-item-label>
          <q-item-label :class="`q-mt-md ${profit.textClass}`"
            >+{{ profit.percentage }}%</q-item-label
          >
        </q-item-section>
      </q-item>

      <q-separator spaced vertical />

      <q-item class="col-2">
        <q-item-section top class="items-center justify-between">
          <q-item-label class="text-grey-6">Cash flow</q-item-label>
          <q-item-label class="q-mt-md">{{ cashFlow }}$</q-item-label>
        </q-item-section>
      </q-item>

      <q-separator spaced vertical />

      <q-item class="col-3">
        <q-item-section top class="justify-between">
          <q-item-label class="text-grey-6 self-center">Target</q-item-label>
          <q-linear-progress
            size="8px"
            :value="target.percentage"
            class="q-mt-md"
          />
          <div class="text-grey-6 text-caption row justify-between">
            <span>{{ portfolio.invested }}$</span>
            <span>{{ target.value }}$</span>
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </q-item-section>

  <q-item-section center side>
    <div class="text-grey-8 q-gutter-xs">
      <q-btn class="gt-xs" size="12px" flat dense round icon="edit" />
      <q-btn size="12px" flat dense round icon="more_vert">
        <q-menu>
          <q-list style="min-width: 200px">
            <q-item clickable v-close-popup>
              <div class="col-12 text-grey-7">
                <q-icon name="delete" size="18px" />
                Delete
              </div>
            </q-item>
            <q-item v-close-popup>
              <div class="col-12 text-grey-7">
                <q-icon name="delete" size="18px" />
                Clone
              </div>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
  </q-item-section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Portfolio } from 'src/types';

export default defineComponent({
  name: 'PortfolioItem',
  props: {
    portfolio: {
      type: Object as PropType<Portfolio>,
      required: true,
    },
  },
  setup(props) {
    const { portfolio } = props;
    const profitValue = portfolio.currentValue - portfolio.invested;

    const target = {
      value: portfolio.target,
      percentage: portfolio.currentValue / portfolio.target,
    };

    const cashFlow = profitValue;
    const profit = {
      value: profitValue,
      textClass: profitValue > 0 ? 'text-green-7' : 'text-red-7',
      percentage: profitValue / portfolio.invested,
    };

    return { target, profit, cashFlow };
  },
});
</script>
