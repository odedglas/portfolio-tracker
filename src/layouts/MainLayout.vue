<template>
  <q-layout view="lHh Lpr lFf">
    <app-header />
    <notifications-drawer />
    <q-page-container class="bg-grey-1" style="overflow-x: hidden">
      <router-view v-slot="{ Component }">
        <transition mode="out-in" name="sub-page">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import AppHeader from 'components/header/AppHeader.vue';
import { useOrchestratorStore } from 'stores/orchestrator';
import NotificationsDrawer from 'components/drawers/NotificationsDrawer.vue';

export default defineComponent({
  name: 'MainLayout',

  components: {
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
