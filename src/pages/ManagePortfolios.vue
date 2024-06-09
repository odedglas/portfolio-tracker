<template>
  <q-page class="row justify-center q-pa-md">
    <div class="col-10">
      <h3 class="text-subtitle1 text-grey-7">
        {{ $t('portfolios.title') }}
      </h3>
      <portfolio-list
        v-if="!loading"
        :portfolios="portfolioStore.portfoliosWithHoldings"
        class="col-12"
        :edit-portfolio="showCreateOrEditPortfolio"
        :delete-portfolio="deletePortfolio"
      />
      <div class="flex items-center column" v-if="isEmpty">
        <p class="text-body1 q-my-md">
          {{ $t('portfolios.empty') }}
        </p>
        <img
          class="q-mr-md"
          src="~assets/cactus.svg"
          alt="empty-state"
          style="height: 180px"
        />
      </div>

      <div v-if="!loading" class="row justify-end q-my-md">
        <q-btn
          size="md"
          outline
          icon="add"
          class="text-primary"
          @click="() => showCreateOrEditPortfolio()"
        >
          {{ $t('portfolios.create') }}
        </q-btn>
      </div>

      <div v-if="loading">
        <q-skeleton
          class="q-my-md"
          v-for="index in [1, 2]"
          :key="index"
          bordered
          square
          height="120px"
        />
        <div class="flex justify-end">
          <q-skeleton width="150px" height="32px" />
        </div>
      </div>
    </div>
    <portfolio-dialog
      :portfolio="portfolioToEdit"
      :show="showPortfolioDialog"
      @close-portfolio="onPortfolioDialogClose"
    />
  </q-page>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';

import { useLoadingStore } from 'stores/loading';
import { usePortfolioStore } from 'src/stores/portfolios';
import portfolioAPI from 'src/service/portfolio';
import { useAreYouSure } from 'src/components/composables/useAreYouSureDialog';
import PortfolioList from 'src/components/portfolio/PortfolioList.vue';
import PortfolioDialog from 'src/components/portfolio/PortfolioDialog.vue';
import { Portfolio } from 'src/types';

export default defineComponent({
  name: 'ManagePortfoliosPage',
  components: {
    PortfolioList,
    PortfolioDialog,
  },
  setup() {
    const portfolioStore = usePortfolioStore();
    const { emitLoadingTask } = useLoadingStore();
    const { showAreYouSure } = useAreYouSure();

    const isEmpty = ref(false);
    const showPortfolioDialog = ref(false);
    const loading = ref(true);
    const portfolioToEdit = ref<Partial<Portfolio> | undefined>(undefined);

    onMounted(async () => {
      const portfolios = await portfolioStore.list();

      loading.value = false;
      isEmpty.value = portfolios?.length === 0;
    });

    const showCreateOrEditPortfolio = async (portfolio?: Portfolio) => {
      const isEdit = !!portfolio?.id;
      if (isEdit) {
        portfolioToEdit.value = { ...portfolio };
      }

      showPortfolioDialog.value = true;
    };

    const onPortfolioDialogClose = () => {
      portfolioToEdit.value = undefined;
      isEmpty.value = false;
      showPortfolioDialog.value = false;
    };

    const deletePortfolio = (portfolio: Portfolio) => {
      showAreYouSure({
        title: 'Delete Portfolio',
        message: `Are you sure you want to delete "${portfolio.title}"?`,
        callback: async () => {
          await emitLoadingTask(() => portfolioAPI.delete(portfolio.id));

          portfolioStore.remove(portfolio.id);
        },
      });
    };

    return {
      loading,
      isEmpty,
      showPortfolioDialog,
      portfolioStore,
      portfolioToEdit,
      showCreateOrEditPortfolio,
      onPortfolioDialogClose,
      deletePortfolio,
    };
  },
});
</script>
