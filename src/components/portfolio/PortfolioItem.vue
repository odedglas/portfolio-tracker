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
            <q-item-label class="text-grey-6 label">{{
              $t('portfolios.invested')
            }}</q-item-label>
            <q-item-label class="q-mt-md"
              >{{ $n(portfolio.invested, 'currency') }}</q-item-label
            >
          </q-item-section>
        </q-item>

        <q-item class="col-2">
          <q-item-section top class="items-center">
            <q-item-label class="text-grey-6 label">{{
              $t('portfolios.kpis.current_value')
            }}</q-item-label>
            <q-item-label>{{ $n(portfolio.currentValue, 'currency')}}$</q-item-label>
          </q-item-section>
        </q-item>

        <q-item class="col-2">
          <q-item-section top class="items-center">
            <q-item-label class="text-grey-6 label">{{
              $t('portfolios.profit')
            }}</q-item-label>
            <q-item-label :class="`flex items-center ${profit.textClass}`">
              <q-icon :name="profit.percentageIcon" size="14px" />
              {{ $n(profit.percentage , 'percent') }}
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item class="col-2">
          <q-item-section top class="items-center">
            <q-item-label class="text-grey-6 label">{{
              $t('portfolios.kpis.cash_flow')
            }}</q-item-label>
            <q-item-label class="q-mt-md">{{ $n(cashFlow , 'currency') }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item class="col-4">
          <q-item-section top>
            <q-item-label class="text-grey-6 self-center label">{{
              $t('portfolios.target')
            }}</q-item-label>
            <div>
              <q-linear-progress
                size="8px"
                :value="showTargets ? target.percentage : 0"
                class="q-my-xs"
              >
                <q-tooltip>
                  {{
                    $t('portfolios.target_explainer', {
                      percentage: $n(target.percentage , 'percent'),
                    })
                  }}
                </q-tooltip>
              </q-linear-progress>
              <div class="text-grey-6 text-caption row justify-between">
                <span>{{ $n(portfolio.invested  , 'currency') }}$</span>
                <span>{{ $n(target.value  , 'currency')}}$</span>
              </div>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-item-section>

    <q-item-section center side class="col">
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
                  {{ $t('delete') }}
                </div>
              </q-item>
              <q-item v-close-popup>
                <div
                  class="col-12 row items-center gap-md text-grey-7"
                  style="gap: 12px"
                >
                  <q-icon name="content_copy" size="18px" />
                  {{ $t('clone') }}
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

const positiveProfit = {
  icon: 'add',
  textClass: 'text-green-7',
  percentageIcon: 'arrow_upward',
};

const negativeProfit = {
  icon: 'minus',
  textClass: 'text-red-7',
  percentageIcon: 'arrow_downward',
};

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

    const cashFlow = profitValue; // TODO - Not really correct, rather should be derived from current
    // portfolio free cash flow

    const profit = {
      value: profitValue,
      percentage: profitValue / portfolio.invested,
      ...(profitValue >= 0 ? positiveProfit : negativeProfit),
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
