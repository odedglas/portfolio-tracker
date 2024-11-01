<template>
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
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useDrawersStore } from 'stores/drawers';
import { useNotificationsStore } from 'stores/notifications';

export default defineComponent({
  name: 'NotificationsButton',
  setup() {
    const drawersStore = useDrawersStore();
    const notificationsStore = useNotificationsStore();

    return {
      drawersStore,
      notificationsStore,
    };
  },
});
</script>

<style lang="scss">
.alerts-icon {
  .q-badge.q-badge--floating {
    top: -2px;
    font-size: 10px;
    line-height: 10px;
    min-height: 10px;
  }
}
</style>
