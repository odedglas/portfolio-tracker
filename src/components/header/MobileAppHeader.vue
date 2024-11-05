<template>
  <q-header elevated>
    <q-toolbar class="flex justify-between">
      <div class="flex items-center q-gap-sm">
        <q-icon
          name="menu"
          class="q-pa-sm"
          size="sm"
          @click="drawersStore.toggleUserProfile(true)"
        />
        <img src="~assets/logo.svg" height="12" alt="app-logo" />
      </div>

      <div>
        <quick-add />

        <stealth-mode-button />

        <notifications-button />
      </div>
    </q-toolbar>
  </q-header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import NotificationsButton from 'components/common/NotificationsButton.vue';
import StealthModeButton from 'components/common/StealthModeButton.vue';
import { useDrawersStore } from 'stores/drawers';
import QuickAdd from 'components/dashboard/QuickAdd.vue';

export default defineComponent({
  name: 'MobileAppHeader',
  components: {
    QuickAdd,
    StealthModeButton,
    NotificationsButton,
  },
  setup() {
    const drawersStore = useDrawersStore();

    return {
      drawersStore,
    };
  },
});
</script>
