<template>
  <q-header elevated>
    <q-toolbar>
      <img class="header-logo q-mr-md" src="~assets/logo.svg" alt="app-logo" />

      <q-toolbar-title class="row justify-between">
        <app-navigation class="desktop-only" />
      </q-toolbar-title>

      <q-btn
        :icon="visibilityIcon"
        flat
        @click="featuresStore.toggleStealthMode"
      >
        <q-tooltip>{{ visibilityHelper }} all numeric values</q-tooltip>
      </q-btn>
      <portfolio-dropdown />
      <user-profile />
    </q-toolbar>
  </q-header>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import PortfolioDropdown from './PortfolioDropdown.vue';
import AppNavigation from './Navigation.vue';
import UserProfile from './UserProfile.vue';
import { useFeaturesStore } from 'stores/features';

export default defineComponent({
  name: 'AppHeader',
  components: {
    AppNavigation,
    PortfolioDropdown,
    UserProfile,
  },
  setup() {
    const featuresStore = useFeaturesStore();

    const visibilityIcon = computed(() =>
      featuresStore.stealthMode ? 'visibility_off' : 'visibility'
    );
    const visibilityHelper = computed(() =>
      featuresStore.stealthMode ? 'Show' : 'Hide'
    );

    return {
      visibilityIcon,
      visibilityHelper,
      featuresStore,
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
