<template>
  <q-page class="row justify-center q-pa-md">
    <div class="col-10 flex column q-gap-md">
      <p class="text-h5 text-grey-7 q-ma-none">
        {{ $t('portfolios.allocation_planner.title') }}
      </p>
      <q-card class="q-px-lg q-my-md">
        <q-card-section class="flex justify-between">
          <div class="flex q-gap-md items-center text-subtitle1">
            <span class="text-grey-7"
              >{{ $t('portfolios.allocation_planner.free_cash') }}:</span
            >
            <span>{{ $n(freeCashFlow, 'currency') }}</span>
          </div>
          <q-separator vertical />
          <div class="flex q-gap-md items-center text-subtitle1">
            <span class="text-grey-7"
              >{{ $t('portfolios.allocation_planner.current_planned') }}:</span
            >
            <span>{{ $n(allocationDetails.plannedValue, 'currency') }}</span>
          </div>
          <q-separator vertical />
          <div class="flex q-gap-md items-center text-subtitle1">
            <span class="text-grey-7"
              >{{ $t('portfolios.allocation_planner.allocation_usage') }}:</span
            >
            <span>{{ $n(allocationDetails.allocationUsage, 'percent') }}</span>
          </div>
          <q-separator vertical />
          <div class="flex q-gap-md items-center text-subtitle1">
            <span class="text-grey-7"
              >{{ $t('portfolios.allocation_planner.missing_cash') }}:</span
            >
            <span>{{ $n(allocationDetails.missingCashFlow, 'currency') }}</span>
          </div>
        </q-card-section>
      </q-card>
      <q-card class="q-px-lg q-pb-md q-my-md">
        <q-card-section class="flex justify-between">
          <span class="text-h6 text-grey-8">Current Allocations</span>
          <q-btn
            outline
            icon="add"
            color="primary"
            @click="() => openEntityModal()"
            :label="$t('portfolios.allocation_planner.add_new_allocation')"
          />
        </q-card-section>

        <q-card-section class="q-py-md">
          <q-table
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
                  {{ $n(props.row.allocationsUsage, 'percent') }}
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
                      @click.stop="() => openEntityModal(props.row)"
                    />
                    <q-btn
                      size="12px"
                      flat
                      dense
                      round
                      icon="delete"
                      @click.stop="() => deleteEntity(props.row)"
                    >
                    </q-btn>
                  </div>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
    <allocation-plan-dialog
      :show="showModal"
      @close="hideEntityModal"
      :plan="editEntity"
      :available-allocation-amount="freeCashFlow"
    />
  </q-page>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { usePortfolioStore } from 'stores/portfolios';
import { portfoliosTransformer } from 'app/shared/transformers';
import AllocationPlanDialog from 'components/allocationPlanner/AllocationPlanDialog.vue';
import { useEditableEntityPage } from 'components/composables/useEditableEntityPage';
import TickerLogo from 'components/common/TickerLogo.vue';
import { AllocationPlan } from 'app/shared/types';
import { columns } from './columns';

export default defineComponent({
  name: 'AllocationPlannerPage',
  components: {
    TickerLogo,
    AllocationPlanDialog,
  },
  setup() {
    const portfolioStore = usePortfolioStore();
    const {
      showModal,
      openEntityModal,
      hideEntityModal,
      editEntity,
      deleteEntity,
    } = useEditableEntityPage<AllocationPlan>({
      deleteModal: {
        title: 'Delete Allocation Plan',
        message: (plan) =>
          `Are you sure you want to delete allocation plan of "${plan.ticker}"?`,
        callback: async (plan) =>
          portfolioStore.updateAllocationPlan(plan, true),
      },
    });

    const freeCashFlow = computed(() => {
      const portfolio = portfolioStore.selectedPortfolioWithHoldings;
      if (!portfolio) {
        return 0;
      }

      return portfoliosTransformer.cashFlow(
        portfolioStore.selectedPortfolioWithHoldings
      );
    });

    const allocationPlans = computed(() => {
      const plans = portfolioStore.selectedPortfolio?.allocationPlans ?? [];

      return plans.map((plan) => {
        const totalValue = plan.shares * plan.targetPrice;
        const allocationsUsage = totalValue / freeCashFlow.value;

        return { ...plan, totalValue, allocationsUsage };
      });
    });

    const allocationDetails = computed(() => {
      const plans = allocationPlans.value;
      const plannedValue = plans.reduce(
        (acc, plan) => acc + plan.totalValue,
        0
      );

      const missingCashFlow =
        plannedValue > freeCashFlow.value
          ? plannedValue - freeCashFlow.value
          : 0;
      const allocationUsage =
        freeCashFlow.value > 0 ? plannedValue / freeCashFlow.value : 0;

      return {
        plannedValue,
        allocationUsage,
        missingCashFlow,
      };
    });

    return {
      columns,
      freeCashFlow,
      allocationDetails,
      allocationPlans,
      showModal,
      editEntity,
      openEntityModal,
      hideEntityModal,
      deleteEntity,
    };
  },
});
</script>
