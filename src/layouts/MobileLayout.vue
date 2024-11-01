<template>
  <q-layout view="lHh Lpr lFf">
    <app-header />
    <notifications-drawer />
    <q-page-container class="bg-grey-1" style="overflow-x: hidden">
      Mobile View!
    </q-page-container>

    <footer-navigation />
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import AppHeader from 'components/header/AppHeader.vue';
import { useOrchestratorStore } from 'stores/orchestrator';
import NotificationsDrawer from 'components/drawers/NotificationsDrawer.vue';
import FooterNavigation from 'components/footer/FooterNavigation.vue';

export default defineComponent({
  name: 'MobileLayout',

  components: {
    FooterNavigation,
    NotificationsDrawer,
    AppHeader,
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
