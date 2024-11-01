<template>
  <q-layout view="lHh Lpr lFf">
    <mobile-app-header />

    <notifications-drawer />

    <user-profile-drawer />

    <q-page-container class="bg-grey-1" style="overflow-x: hidden">
      <q-tab-panels v-model="tab" animated swipeable>
        <q-tab-panel name="home">
          <q-page>
            <div class="text-h6">Mails</div>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
          </q-page>
        </q-tab-panel>
        <q-tab-panel name="portfolio">
          <q-page>
            <div class="text-h6">Alarms</div>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
          </q-page>
        </q-tab-panel>
        <q-tab-panel name="analytics">
          <q-page>
            <div class="text-h6">Alarms</div>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
          </q-page>
        </q-tab-panel>
        <q-tab-panel name="stocks">
          <q-page>
            <div class="text-h6">Movies</div>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
          </q-page>
        </q-tab-panel>
      </q-tab-panels>

      <q-footer>
        <q-tabs
          v-model="tab"
          dense
          class="bg-primary text-white"
          align="justify"
          indicator-color="pink-4"
          switch-indicator
        >
          <q-tab name="home" no-caps label="Home" icon="home" />
          <q-tab
            name="portfolio"
            no-caps
            label="Portfolio"
            icon="business_center"
          />
          <q-tab name="analytics" no-caps label="Analytics" icon="bar_chart" />
          <q-tab name="stocks" no-caps label="Stocks" icon="inventory" />
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

export default defineComponent({
  name: 'MobileLayout',

  components: {
    UserProfileDrawer,
    MobileAppHeader,
    NotificationsDrawer,
  },

  setup() {
    const tab = ref('home');
    const orchestratorStore = useOrchestratorStore();

    onMounted(async () => {
      await orchestratorStore.initialize();
    });

    return {
      tab,
    };
  },
});
</script>
