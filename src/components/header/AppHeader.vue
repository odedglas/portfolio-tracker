<template>
  <q-header elevated>
    <q-toolbar>
      <img
        v-if="$q.platform.is.desktop"
        class="header-logo q-mr-md"
        src="~assets/logo.svg"
        alt="app-logo"
      />
      <img
        v-else
        class="header-logo q-mr-md"
        height="24"
        src="~assets/logo-short.svg"
        alt="app-logo"
      />

      <app-navigation class="desktop-only" />

      <stealth-mode-button />

      <q-btn
        icon="notifications_none"
        class="alerts-icon"
        flat
        @click="drawersStore.toggleNotifications(true)"
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
import { useDrawersStore } from 'stores/drawers';
import StealthModeButton from 'components/common/StealthModeButton.vue';

export default defineComponent({
  name: 'AppHeader',
  components: {
    StealthModeButton,
    AppNavigation,
    PortfolioDropdown,
    UserProfile,
  },
  setup() {
    const drawersStore = useDrawersStore();
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
      drawersStore,
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
