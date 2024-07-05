<template>
  <q-page class="row justify-center q-pa-md">
    <div class="col-10">
      <p class="text-h5 text-grey-7 q-my-md">{{ $t('portfolios.title') }}</p>
      <portfolio-list
        v-if="!loading"
        :portfolios="portfolioStore.portfoliosWithHoldings"
        class="col-12"
        :edit-portfolio="openEntityModal"
        :delete-portfolio="deleteEntity"
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
          @click="() => openEntityModal()"
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
      :portfolio="editEntity"
      :show="showModal"
      @close-portfolio="hideEntityModal"
    />
  </q-page>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue';
import { usePortfolioStore } from 'src/stores/portfolios';
import portfolioAPI from 'src/service/portfolio';
import PortfolioList from 'src/components/portfolio/PortfolioList.vue';
import PortfolioDialog from 'src/components/portfolio/PortfolioDialog.vue';
import { useEditableEntityPage } from 'components/composables/useEditableEntityPage';
import { Portfolio } from 'app/shared/types';

export default defineComponent({
  name: 'ManagePortfoliosPage',
  components: {
    PortfolioList,
    PortfolioDialog,
  },
  setup() {
    const portfolioStore = usePortfolioStore();
    const {
      showModal,
      editEntity,
      openEntityModal,
      hideEntityModal,
      deleteEntity,
    } = useEditableEntityPage<Portfolio>({
      deleteModal: {
        title: 'Delete Portfolio',
        message: (portfolio) =>
          `Are you sure you want to delete "${portfolio.title}"?`,
        callback: async (portfolio) => {
          await portfolioAPI.delete(portfolio.id);

          portfolioStore.remove(portfolio.id);
        },
      },
    });
    const isEmpty = ref(false);
    const loading = ref(true);

    onMounted(async () => {
      loading.value = false;
    });

    watch(
      () => portfolioStore.portfolios,
      (portfolios) => {
        isEmpty.value = portfolios.length === 0;
      }
    );

    return {
      loading,
      isEmpty,
      showModal,
      portfolioStore,
      editEntity,
      openEntityModal,
      hideEntityModal,
      deleteEntity,
    };
  },
});
</script>
