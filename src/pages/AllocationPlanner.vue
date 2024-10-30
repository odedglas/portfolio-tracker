<template>
  <q-page class="row justify-center q-pa-md">
    <div class="col-10 flex column q-gap-md">
      <p class="text-h5 text-grey-7 q-ma-none">
        {{ $t('portfolios.allocation_planner.title') }}
      </p>
      <q-card class="q-px-lg q-my-md">
        <q-card-section class="flex justify-between">
          <allocations-panner-summary />
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
          <allocations-panner-table
            v-if="allocationPlans.length"
            @open-entity-modal="(entity) => openEntityModal(entity)"
            @delete-entity="(entity) => deleteEntity(entity)"
          />
          <div v-else>
            <span class="text-grey-7 text-caption">{{
              $t('portfolios.allocation_planner.empty_plans')
            }}</span>
          </div>
        </q-card-section>
      </q-card>
    </div>
    <allocation-plan-dialog
      :show="showModal"
      @close="hideEntityModal"
      :plan="editEntity"
      :available-allocation-amount="
        allocationPlansStore.allocationsSummary.availableCash
      "
    />
  </q-page>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import AllocationPlanDialog from 'components/allocationPlanner/AllocationPlanDialog.vue';
import { useEditableEntityPage } from 'components/composables/useEditableEntityPage';
import { AllocationPlan } from 'app/shared/types';
import AllocationsPannerSummary from 'components/allocationPlanner/AllocationsPannerSummary.vue';
import { useAllocationPlansStore } from 'stores/allocationPlans';
import AllocationsPannerTable from 'components/allocationPlanner/AllocationPlannerTable.vue';

export default defineComponent({
  name: 'AllocationPlannerPage',
  components: {
    AllocationsPannerTable,
    AllocationsPannerSummary,
    AllocationPlanDialog,
  },
  setup() {
    const allocationPlansStore = useAllocationPlansStore();
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
          allocationPlansStore.updateAllocationPlan(plan, true),
      },
    });

    const allocationPlans = computed(() => allocationPlansStore.plans);

    return {
      allocationPlans,
      allocationPlansStore,
      showModal,
      editEntity,
      openEntityModal,
      hideEntityModal,
      deleteEntity,
    };
  },
});
</script>
