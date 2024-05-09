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
        <q-list style="min-width: 100px">
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
            v-if="!portfolioStore.portfolios.length"
          >
            <p class="text-subtitle1">{{ $t('header.no_portfolios') }}</p>
            <q-btn size="md" flat color="primary">
              {{ $t('create') }}
            </q-btn>
          </div>
        </q-list>
      </q-btn-dropdown>

      <q-avatar text-color="grey" color="white" class="text-subtitle1"
        >P</q-avatar
      >
    </q-toolbar>
  </q-header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { usePortfolioStore } from 'stores/portfolios';
import AppNavigation from './Navigation.vue';

export default defineComponent({
  name: 'AppHeader',
  components: {
    AppNavigation,
  },
  setup() {
    const portfolioStore = usePortfolioStore();

    return {
      portfolioStore,
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
