<template>
  <q-layout view="lHh Lpr lFf">
    <app-header @notifications-click="notificationsDrawerOpen = true" />
    <notifications-drawer
      :open="notificationsDrawerOpen"
      @open-drawer="notificationsDrawerOpen = true"
      @close-drawer="notificationsDrawerOpen = false"
    />
    <q-page-container class="bg-grey-1" style="overflow-x: hidden">
      <router-view v-slot="{ Component }">
        <transition mode="out-in" name="sub-page">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </transition>
      </router-view>
    </q-page-container>

    <footer-navigation v-if="$q.platform.is.mobile" />
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import AppHeader from 'components/header/AppHeader.vue';
import { useOrchestratorStore } from 'stores/orchestrator';
import NotificationsDrawer from 'components/drawers/NotificationsDrawer.vue';
import FooterNavigation from 'components/footer/FooterNavigation.vue';

export default defineComponent({
  name: 'MainLayout',

  components: {
    FooterNavigation,
    NotificationsDrawer,
    AppHeader,
  },

  setup() {
    const tab = ref('');
    const notificationsDrawerOpen = ref(false);
    const orchestratorStore = useOrchestratorStore();

    onMounted(async () => {
      await orchestratorStore.initialize();
    });

    return {
      tab,
      notificationsDrawerOpen,
    };
  },
});
</script>
