<template>
  <q-drawer
    :model-value="drawersStore.notificationsOpen"
    elevated
    :width="$q.platform.is.desktop ? 390 : 350"
    class="notifications-drawer"
    @hide="drawersStore.toggleNotifications(false)"
    @show="drawersStore.toggleNotifications(true)"
    side="right"
    overlay
    behavior="mobile"
  >
    <q-toolbar class="bg-primary text-white justify-end">
      <q-btn
        flat
        round
        dense
        icon="close"
        @click="drawersStore.toggleNotifications(false)"
      />
    </q-toolbar>
    <div class="q-mt-sm q-pa-md">
      <q-btn-toggle
        v-model="tabModel"
        spread
        class="notifications-drawer-button-toggle"
        no-caps
        unelevated
        rounded
        toggle-color="primary"
        text-color="primary"
        :options="[
          {
            label: 'Notifications',
            value: 'notifications',
            icon: 'notifications_none',
          },
          { label: 'Alerts', value: 'alerts', icon: 'alarm' },
        ]"
      />
    </div>
    <div class="q-py-sm q-px-md">
      <notifications-tab v-if="tabModel === 'notifications'" />
      <alerts-tab v-else-if="tabModel === 'alerts'" />
    </div>
  </q-drawer>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useNotificationsStore } from 'stores/notifications';
import { useDrawersStore } from 'stores/drawers';
import NotificationsTab from 'components/drawers/NotificationsTab.vue';
import AlertsTab from 'components/drawers/AlertsTab.vue';

export default defineComponent({
  name: 'NotificationsDrawer',
  components: {
    AlertsTab,
    NotificationsTab,
  },
  setup() {
    const tabModel = ref('notifications');
    const drawersStore = useDrawersStore();
    const notificationsStore = useNotificationsStore();

    return {
      tabModel,
      drawersStore,
      notificationsStore,
    };
  },
});
</script>

<style lang="scss">
.notifications-drawer {
  .notifications-list {
    .notification {
      transition: box-shadow 0.2s cubic-bezier(0, 0.5, 0.265, 2),
        transform 0.2s cubic-bezier(0, 0.5, 0.265, 2);

      &:hover {
        transform: scale(1.02);
        box-shadow: 0 3px 10px 0 rgba(0, 0, 0, 0.2);
        background: $grey-2;
      }

      &.unread {
        background: $grey-2;
      }
    }

    .q-item__section--main + .q-item__section--main {
      margin-left: 0;
    }
  }

  .notifications-drawer-button-toggle {
    border: 1px solid $primary;
  }
}
</style>
