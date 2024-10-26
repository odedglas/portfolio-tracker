<template>
  <q-header elevated>
    <q-toolbar>
      <img class="header-logo q-mr-md" src="~assets/logo.svg" alt="app-logo" />

      <q-toolbar-title class="row justify-between">
        <app-navigation class="desktop-only" />
      </q-toolbar-title>

      <q-btn
        icon="notifications_none"
        class="alerts-icon"
        flat
        @click="() => $emit('notifications-click')"
      >
        <q-badge
          v-if="notificationsStore.unreadNotifications.length"
          color="white"
          text-color="primary"
          floating
          rounded
          >{{ notificationsStore.unreadNotifications.length }}</q-badge
        >
      </q-btn>
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
import { useNotificationsStore } from 'stores/notifications';

export default defineComponent({
  name: 'AppHeader',
  components: {
    AppNavigation,
    PortfolioDropdown,
    UserProfile,
  },
  emits: ['notifications-click'],
  setup() {
    const featuresStore = useFeaturesStore();
    const notificationsStore = useNotificationsStore();

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
      notificationsStore,
    };
  },
});
</script>

<style lang="scss">
.header-logo {
  width: 225px;
}

.alerts-icon {
  .q-badge.q-badge--floating {
    top: -2px;
    font-size: 10px;
    line-height: 10px;
    min-height: 10px;
  }
}
</style>
