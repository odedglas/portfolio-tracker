<template>
  <q-header elevated>
    <q-toolbar>
      <img class="header-logo q-mr-md" src="~assets/logo.svg" alt="app-logo" />

      <q-toolbar-title class="row justify-between">
        <app-navigation class="desktop-only" />
      </q-toolbar-title>

      <portfolio-dropdown />

      <q-avatar text-color="grey" color="white" class="text-subtitle1"
        >P</q-avatar
      >
    </q-toolbar>
  </q-header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import PortfolioDropdown from './PortfolioDropdown.vue';
import AppNavigation from './Navigation.vue';

export default defineComponent({
  name: 'AppHeader',
  components: {
    AppNavigation,
    PortfolioDropdown,
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
