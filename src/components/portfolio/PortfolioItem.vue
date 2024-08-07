<template>
  <q-item>
    <q-item-section avatar center class="text-grey-8" style="min-width: 36px">
      <q-icon name="business_center" size="24px" />
    </q-item-section>

    <q-item-section center class="col-1">
      <q-item-label class="text-subtitle2">{{
        viewPortfolio.title
      }}</q-item-label>
    </q-item-section>

    <q-separator spaced vertical />

    <q-item-section top class="col-9">
      <q-list class="row kpi-list">
        <q-item class="col-2">
          <q-item-section top class="items-center">
            <q-item-label class="text-grey-6 label">{{
              $t('portfolios.invested')
            }}</q-item-label>
            <q-item-label class="q-mt-md">{{
              $n(viewPortfolio.invested, 'currency')
            }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item class="col-2">
          <q-item-section top class="items-center">
            <q-item-label class="text-grey-6 label">{{
              $t('portfolios.kpis.holdings_value')
            }}</q-item-label>
            <q-item-label
              >{{ $n(viewPortfolio.currentValue, 'currency') }}$</q-item-label
            >
          </q-item-section>
        </q-item>

        <q-item class="col-2">
          <q-item-section top class="items-center">
            <q-item-label class="text-grey-6 label">{{
              $t('portfolios.profit')
            }}</q-item-label>
            <q-item-label
              :class="`flex items-center ${viewPortfolio.profitMeta.textClass}`"
            >
              <q-icon
                :name="viewPortfolio.profitMeta.percentageIcon"
                size="14px"
              />
              {{ $n(viewPortfolio.kpis.profit.percentage, 'percent') }}
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item class="col-2">
          <q-item-section top class="items-center">
            <q-item-label class="text-grey-6 label">{{
              $t('portfolios.kpis.cash_flow')
            }}</q-item-label>
            <q-item-label class="q-mt-md">{{
              $n(viewPortfolio.cashFlow, 'currency')
            }}</q-item-label>
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
                :value="showTargets ? viewPortfolio.kpis.target.percentage : 0"
                class="q-my-xs"
              >
                <q-tooltip>
                  {{
                    $t('portfolios.target_explainer', {
                      percentage: $n(
                        viewPortfolio.kpis.target.percentage,
                        'percent'
                      ),
                    })
                  }}
                </q-tooltip>
              </q-linear-progress>
              <div class="text-grey-6 text-caption row justify-between">
                <span>{{ $n(viewPortfolio.initialDeposit, 'currency') }}$</span>
                <span
                  >{{ $n(viewPortfolio.kpis.target.value, 'currency') }}$</span
                >
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
        <q-btn
          size="12px"
          flat
          dense
          round
          icon="delete"
          @click="$emit('deletePortfolio', portfolio)"
        >
        </q-btn>
      </div>
    </q-item-section>
  </q-item>
  <q-separator spaced v-if="withSpacer" />
</template>

<script lang="ts">
import { defineComponent, PropType, ref, onMounted, computed } from 'vue';
import { portfoliosTransformer } from 'app/shared/transformers';
import { Portfolio } from 'app/shared/types';

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
    // TODO - Better UI X.x. Portfolios to cards / Target success indicator
    const viewPortfolio = computed(() => ({
      ...props.portfolio,
      initialDeposit: portfoliosTransformer.initialDeposit(props.portfolio),
      cashFlow: portfoliosTransformer.cashFlow(props.portfolio),
      depositValue: portfoliosTransformer.depositsValue(props.portfolio),
      profitMeta: portfolio.profit >= 0 ? positiveProfit : negativeProfit,
      kpis: portfoliosTransformer.portfolioKPIS(props.portfolio),
    }));

    const { portfolio } = props;

    onMounted(() => {
      requestAnimationFrame(() => (showTargets.value = true));
    });

    return { viewPortfolio, showTargets };
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
