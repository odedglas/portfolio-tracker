<template>
  <q-item>
    <q-item-section avatar center class="text-grey-8" style="min-width: 36px">
      <q-icon name="business_center" size="24px" />
    </q-item-section>

    <q-item-section center class="col-1">
      <q-item-label class="text-subtitle2">{{ portfolio.title }}</q-item-label>
    </q-item-section>

    <q-separator spaced vertical />

    <q-item-section top class="col-9">
      <q-list class="row kpi-list">
        <q-item class="col-2">
          <q-item-section top class="items-center">
            <q-item-label class="text-grey-6 label">Invested</q-item-label>
            <q-item-label class="q-mt-md"
              >{{ portfolio.invested }}$</q-item-label
            >
          </q-item-section>
        </q-item>

        <q-item class="col-2">
          <q-item-section top class="items-center">
            <q-item-label class="text-grey-6 label">Current Value</q-item-label>
            <q-item-label>{{ portfolio.currentValue }}$</q-item-label>
          </q-item-section>
        </q-item>

        <q-item class="col-2">
          <q-item-section top class="items-center">
            <q-item-label class="text-grey-6 label">Profit</q-item-label>
            <q-item-label :class="profit.textClass">
              <q-icon :name="profit.percentageIcon" size="14px" />
              {{ profit.percentage }}%
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item class="col-2">
          <q-item-section top class="items-center">
            <q-item-label class="text-grey-6 label">Cash Flow</q-item-label>
            <q-item-label class="q-mt-md">{{ cashFlow }}$</q-item-label>
          </q-item-section>
        </q-item>

        <q-item class="col-4">
          <q-item-section top>
            <q-item-label class="text-grey-6 self-center label"
              >Target</q-item-label
            >
            <div>
              <q-linear-progress
                size="8px"
                :value="showTargets ? target.percentage : 0"
                class="q-my-xs"
              />
              <div class="text-grey-6 text-caption row justify-between">
                <span>{{ portfolio.invested }}$</span>
                <span>{{ target.value }}$</span>
              </div>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-item-section>

    <q-item-section center side class="col-1">
      <div class="text-grey-8 q-gutter-xs">
        <q-btn
          class="gt-xs"
          size="12px"
          flat
          dense
          round
          icon="edit"
          @click="$emit('editPortfolio', portfolio)"
        />
        <q-btn size="12px" flat dense round icon="more_vert">
          <q-menu>
            <q-list style="min-width: 200px">
              <q-item
                clickable
                v-close-popup
                @click="$emit('deletePortfolio', portfolio)"
              >
                <div
                  class="col-12 row items-center gap-md text-grey-7"
                  style="gap: 12px"
                >
                  <q-icon name="delete" size="18px" />
                  Delete
                </div>
              </q-item>
              <q-item v-close-popup>
                <div
                  class="col-12 row items-center gap-md text-grey-7"
                  style="gap: 12px"
                >
                  <q-icon name="content_copy" size="18px" />
                  Clone
                </div>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </q-item-section>
  </q-item>
  <q-separator spaced v-if="withSpacer" />
</template>

<script lang="ts">
import { defineComponent, PropType, ref, onMounted } from 'vue';
import { Portfolio } from 'src/types';

export default defineComponent({
  name: 'PortfolioItem',
  props: {
    portfolio: {
      type: Object as PropType<Portfolio>,
      required: true,
    },
    withSpacer: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['editPortfolio', 'deletePortfolio'],
  setup(props) {
    const showTargets = ref(false);
    const { portfolio } = props;
    const profitValue = portfolio.currentValue - portfolio.invested;

    onMounted(() => {
      requestAnimationFrame(() => (showTargets.value = true));
    });

    const target = {
      value: portfolio.target,
      percentage: portfolio.currentValue / portfolio.target,
    };

    const cashFlow = profitValue;
    const profit = {
      value: profitValue,
      icon: profitValue > 0 ? 'add' : 'minus',
      textClass: profitValue > 0 ? 'text-green-7' : 'text-red-7',
      percentage: profitValue / portfolio.invested,
      percentageIcon: profitValue > 0 ? 'arrow_upward' : 'arrow_downward',
    };

    return { showTargets, target, profit, cashFlow };
  },
});
</script>

<style lang="scss">
.kpi-list {
  .q-item__section {
    gap: 16px;
  }

  .q-item {
    &:not(:last-child) {
      border-right: 1px solid $grey-4;
    }
  }
}

.label {
  font-size: 0.8rem;
}
</style>
