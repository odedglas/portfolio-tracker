<template>
  <q-header elevated>
    <q-toolbar>
      <img
        v-if="$q.platform.is.desktop"
        class="header-logo q-mr-md"
        src="~assets/logo.svg"
        alt="app-logo"
      />

      <q-toolbar-title>
        <app-navigation />
      </q-toolbar-title>

      <refresh-finance-data-button />

      <stealth-mode-button />

      <notifications-button />

      <portfolio-dropdown />

      <user-profile-drop-down />
    </q-toolbar>
  </q-header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import PortfolioDropdown from './PortfolioDropdown.vue';
import AppNavigation from './Navigation.vue';
import UserProfileDropDown from './UserProfileDropDown.vue';
import StealthModeButton from 'components/common/StealthModeButton.vue';
import NotificationsButton from 'components/common/NotificationsButton.vue';
import RefreshFinanceDataButton from 'components/common/RefreshFinanceDataButton.vue';

export default defineComponent({
  name: 'AppHeader',
  components: {
    RefreshFinanceDataButton,
    NotificationsButton,
    StealthModeButton,
    AppNavigation,
    PortfolioDropdown,
    UserProfileDropDown,
  },
});
</script>

<style lang="scss">
.header-logo {
  width: 225px;
}
</style>
