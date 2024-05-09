<template>
  <q-page class="row justify-center q-pa-md">
    <div class="col-10">
      <h3 class="text-subtitle1 text-grey-7">
        {{ $t('portfolios.title') }}
      </h3>
      <portfolio-list
        v-if="!loading"
        :portfolios="portfolios"
        class="col-12"
        :edit-portfolio="showCreateOrEditPortfolio"
        :delete-portfolio="deletePortfolio"
      />
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
      @close-portfolio="() => (portfolioToEdit = undefined)"
      @save-portfolio="savePortfolio"
    />
  </q-page>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, Ref } from 'vue';

import { useLoadingStore } from 'stores/loading';
import { authentication } from 'src/service/firebase';
import collections from 'src/service/firebase/collections';
import { useAreYouSure } from 'src/components/composables/useAreYouSureDialog';
import PortfolioList from 'src/components/portfolio/PortfolioList.vue';
import PortfolioDialog from 'src/components/portfolio/PortfolioDialog.vue';
import { Portfolio } from 'src/types';

const emptyPortfolioTemplate = (): Portfolio => ({
  id: '',
  title: '',
  currentValue: 0,
  invested: 0,
  target: 0,
  profit: 0,
  owner: 'none',
  createdAt: Date.now(),
  deposits: [],
});

export default defineComponent({
  name: 'PortfoliosPage',
  components: {
    PortfolioList,
    PortfolioDialog,
  },
  setup() {
    const { showAreYouSure } = useAreYouSure();

    const loading = ref(true);
    const portfolioToEdit = ref<Partial<Portfolio> | undefined>(undefined);
    const portfolios: Ref<Portfolio[]> = ref([]);
    const { emitLoadingTask } = useLoadingStore();

    onMounted(async () => {
      portfolios.value = await emitLoadingTask(() =>
        collections.portfolio.all()
      );

      loading.value = false;
    });

    const showCreateOrEditPortfolio = async (portfolio?: Portfolio) => {
      const isEdit = !!portfolio?.id;
      portfolioToEdit.value = isEdit
        ? { ...portfolio }
        : emptyPortfolioTemplate();
    };

    const savePortfolio = async (portfolio: Portfolio) => {
      let isNewPortfolio = !portfolio.id;

      const syncState = (portfolio: Portfolio) => {
        if (isNewPortfolio) {
          portfolios.value.push(portfolio);
        } else {
          const index = portfolios.value.findIndex(
            (p) => p.id === portfolio.id
          );
          portfolios.value[index] = portfolio;
        }
      };

      const portfolioId = isNewPortfolio
        ? portfolio.title.toLowerCase().split(' ').join('-')
        : portfolio.id;

      if (isNewPortfolio) {
        portfolio.createdAt = Date.now();
        portfolio.owner = authentication.currentUser.uid;
        portfolio.deposits = [
          { date: Date.now(), value: portfolio.currentValue },
        ];
        portfolio.id = portfolioId;
      }

      await emitLoadingTask(() =>
        collections.portfolio.update(portfolioId, portfolio)
      );

      portfolioToEdit.value = undefined;

      syncState(portfolio);
    };

    const deletePortfolio = (portfolio: Portfolio) => {
      showAreYouSure({
        title: 'Delete Portfolio',
        message: `Are you sure you want to delete "${portfolio.title}"?`,
        callback: async () => {
          await emitLoadingTask(() =>
            collections.portfolio.delete(portfolio.id)
          );

          portfolios.value = portfolios.value.filter(
            (p) => p.id !== portfolio.id
          );
        },
      });
    };

    return {
      loading,
      portfolios,
      portfolioToEdit,
      showCreateOrEditPortfolio,
      deletePortfolio,
      savePortfolio,
    };
  },
});
</script>
