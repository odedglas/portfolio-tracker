<template>
  <q-layout view="lHh Lpr lFf">
    <mobile-app-header />

    <notifications-drawer />

    <user-profile-drawer />

    <q-page-container style="overflow-x: hidden">
      <q-tab-panels v-model="activeTab" animated swipeable>
        <q-tab-panel
          v-for="tab in tabs"
          :name="tab.name"
          :key="tab.name"
          class="q-pa-none bg-grey-1"
        >
          <q-page>
            <div class="text-h6">{{ tab.label }}</div>
            <component :is="tab.page" />
          </q-page>
        </q-tab-panel>
      </q-tab-panels>

      <q-footer>
        <q-tabs
          v-model="activeTab"
          dense
          class="bg-primary text-white"
          align="justify"
          indicator-color="pink-4"
          switch-indicator
        >
          <q-tab
            v-for="tab in tabs"
            :key="tab.name"
            :name="tab.name"
            no-caps
            :label="tab.label"
            :icon="tab.icon"
          />
        </q-tabs>
      </q-footer>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useOrchestratorStore } from 'stores/orchestrator';
import NotificationsDrawer from 'components/drawers/NotificationsDrawer.vue';
import MobileAppHeader from 'components/header/MobileAppHeader.vue';
import UserProfileDrawer from 'components/drawers/UserProfileDrawer.vue';
import MobileDashboard from 'src/mobilePages/MobileDashboard.vue';
import MobilePortfolio from 'src/mobilePages/MobilePortfolio.vue';
import MobileAnalytics from 'src/mobilePages/MobileAnalytics.vue';
import MobileStockPlans from 'src/mobilePages/MobileStockPlans.vue';

export default defineComponent({
  name: 'MobileLayout',

  components: {
    UserProfileDrawer,
    MobileAppHeader,
    NotificationsDrawer,
  },

  setup() {
    const activeTab = ref('dashboard');
    const orchestratorStore = useOrchestratorStore();

    const tabs = [
      {
        name: 'dashboard',
        label: 'Dashboard',
        icon: 'home',
        page: MobileDashboard,
      },
      {
        name: 'portfolio',
        label: 'Portfolio',
        icon: 'business_center',
        page: MobilePortfolio,
      },
      {
        name: 'analytics',
        label: 'Analytics',
        icon: 'bar_chart',
        page: MobileAnalytics,
      },
      {
        name: 'stocks',
        label: 'Plans',
        icon: 'inventory',
        page: MobileStockPlans,
      },
    ];

    onMounted(async () => {
      await orchestratorStore.initialize();
    });

    return {
      activeTab,
      tabs,
    };
  },
});
</script>
