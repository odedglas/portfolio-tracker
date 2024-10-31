<template>
  <q-btn-dropdown
    color="white"
    flat
    no-caps
    class="q-mx-sm"
    icon="business_center"
    :label="getPortfolioDropdownLabel()"
  >
    <q-list style="min-width: 100px" bordered>
      <q-item
        clickable
        v-close-popup
        v-for="portfolio in portfolioStore.portfoliosWithHoldings"
        :key="portfolio.id"
        @click="() => selectPortfolio(portfolio)"
        :active="portfolio.id === portfolioStore.selectedPortfolioId"
      >
        <q-item-section>
          <q-item-label>{{ portfolio.title }}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-item-label caption>{{
            $n(portfolio.currentValue, 'currency')
          }}</q-item-label>
        </q-item-section>
      </q-item>
      <div
        class="flex column q-pa-md"
        style="max-width: fit-content"
        v-if="!portfolioStore.portfolios.length"
      >
        <p class="text-subtitle1">{{ $t('header.no_portfolios') }}</p>
      </div>
      <q-item class="row" style="gap: 12px">
        <q-btn
          size="sm"
          outline
          icon="add"
          color="primary"
          @click="showPortfolioDialog = true"
        >
          {{ $t('create') }}
        </q-btn>

        <q-btn
          :disable="isManagePortfolios"
          size="sm"
          class="col q-mr-sm"
          icon="settings"
          outline
          color="primary"
          @click="gotoManagePortfolios"
        >
          {{ $t('header.manage_portfolios') }}
        </q-btn>
      </q-item>
    </q-list>
  </q-btn-dropdown>
  <portfolio-dialog
    :show="showPortfolioDialog"
    @close-portfolio="() => (showPortfolioDialog = false)"
  />
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePortfolioStore } from 'stores/portfolios';
import PortfolioDialog from 'src/components/portfolio/PortfolioDialog.vue';
import { Portfolio } from 'app/shared/types';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'PortfolioDropdown',
  components: {
    PortfolioDialog,
  },
  setup() {
    const $q = useQuasar();
    const showPortfolioDialog = ref(false);
    const router = useRouter();
    const portfolioStore = usePortfolioStore();

    const gotoManagePortfolios = () => router.push('/manage-portfolios');
    const isManagePortfolios = computed(() =>
      router.currentRoute.value.path.includes('manage-portfolios')
    );

    const selectPortfolio = (portfolio: Portfolio) => {
      portfolioStore.selectPortfolio(portfolio.id);
    };

    const getPortfolioDropdownLabel = () => {
      if ($q.platform.is.mobile) {
        return '';
      }

      if (portfolioStore.selectedPortfolio) {
        return portfolioStore.selectedPortfolio.title;
      }

      return 'No Portfolios';
    };

    return {
      portfolioStore,
      showPortfolioDialog,
      gotoManagePortfolios,
      isManagePortfolios,
      selectPortfolio,
      getPortfolioDropdownLabel,
    };
  },
});
</script>

<style lang="scss">
.navigation-buttons-container {
  .nav-btn:hover,
  .nav-btn.active {
    color: white !important;
  }

  .nav-btn.active {
    .q-focus-helper {
      background: currentColor;
      opacity: 0.15;
    }
  }
}
</style>
