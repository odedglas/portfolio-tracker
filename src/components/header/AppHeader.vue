<template>
  <q-header elevated>
    <q-toolbar>
      <img class="header-logo q-mr-md" src="~assets/logo.svg" alt="app-logo" />

      <q-toolbar-title class="row justify-between">
        <app-navigation class="desktop-only" />
      </q-toolbar-title>

      <q-btn-dropdown
        color="white"
        flat
        no-caps
        class="q-mx-sm"
        icon="business_center"
        :label="portfolioStore.selectedPortfolio?.title || 'No Portfolios'"
      >
        <q-list style="min-width: 100px" bordered>
          <q-item
            clickable
            v-for="portfolio in portfolioStore.portfolios"
            :key="portfolio.id"
            :active="portfolio.id === portfolioStore.selectedPortfolioId"
          >
            <q-item-section>{{ portfolio.title }}</q-item-section>
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
              color="secondary"
              @click="showPortfolioDialog = true"
            >
              {{ $t('create') }}
            </q-btn>

            <q-btn
              :disable="isManagePortfolios"
              size="sm"
              class="col"
              icon="settings"
              outline
              color="secondary"
              @click="gotoManagePortfolios"
            >
              {{ $t('header.manage_portfolios') }}
            </q-btn>
          </q-item>
        </q-list>
      </q-btn-dropdown>

      <q-avatar text-color="grey" color="white" class="text-subtitle1"
        >P</q-avatar
      >
    </q-toolbar>
    <portfolio-dialog
      :show="showPortfolioDialog"
      @close-portfolio="() => (showPortfolioDialog = false)"
    />
  </q-header>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePortfolioStore } from 'stores/portfolios';
import PortfolioDialog from 'src/components/portfolio/PortfolioDialog.vue';
import AppNavigation from './Navigation.vue';

export default defineComponent({
  name: 'AppHeader',
  components: {
    AppNavigation,
    PortfolioDialog,
  },
  setup() {
    const showPortfolioDialog = ref(false);
    const router = useRouter();
    const portfolioStore = usePortfolioStore();

    const gotoManagePortfolios = () => router.push('/manage-portfolios');
    const isManagePortfolios = computed(() =>
      router.currentRoute.value.path.includes('manage-portfolios')
    );

    return {
      portfolioStore,
      showPortfolioDialog,
      gotoManagePortfolios,
      isManagePortfolios,
    };
  },
});
</script>

<style lang="scss">
.header-logo {
  width: 225px;
}

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
