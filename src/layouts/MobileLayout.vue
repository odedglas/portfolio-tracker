<template>
  <q-layout view="lHh Lpr lFf">
    <mobile-app-header />
    <notifications-drawer />
    <user-profile-drawer />

    <q-page-container class="bg-grey-1" style="overflow-x: hidden">
      Mobile View!
    </q-page-container>

    <footer-navigation />
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useOrchestratorStore } from 'stores/orchestrator';
import NotificationsDrawer from 'components/drawers/NotificationsDrawer.vue';
import FooterNavigation from 'components/footer/FooterNavigation.vue';
import MobileAppHeader from 'components/header/MobileAppHeader.vue';
import UserProfileDrawer from 'components/drawers/UserProfileDrawer.vue';

export default defineComponent({
  name: 'MobileLayout',

  components: {
    UserProfileDrawer,
    MobileAppHeader,
    FooterNavigation,
    NotificationsDrawer,
  },

  setup() {
    const orchestratorStore = useOrchestratorStore();

    onMounted(async () => {
      await orchestratorStore.initialize();
    });

    return {};
  },
});
</script>
