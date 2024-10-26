<template>
  <q-drawer
    :model-value="open"
    elevated
    :width="400"
    class="notifications-drawer"
    @hide="$emit('close-drawer')"
    side="right"
    overlay
    behavior="mobile"
  >
    <q-toolbar class="bg-primary text-white">
      <q-toolbar-title class="row items-center">
        <q-icon name="alerts" class="q-mr-md" />
        Notifications
      </q-toolbar-title>
      <q-btn flat round dense icon="close" @click="$emit('close-drawer')" />
    </q-toolbar>
    <q-list class="notifications-list q-py-lg q-px-md">
      <q-item
        v-for="notification in notificationsStore.notifications"
        :key="notification.id"
        :class="`notification column q-gap-md ${
          notification.unread ? 'unread' : 'read'
        }`"
      >
        <component
          :is="getNotificationComponent(notification)"
          :payload="notification.data"
        />

        <q-item-section class="row justify-between items-center flex-row">
          <q-item-label caption class="q-ml-none"
            >Sent at:
            {{ formatNotificationDate(notification.createdAt) }}</q-item-label
          >
          <q-btn
            flat
            :label="`Mark as ${notification.unread ? 'read' : 'unread'}`"
            size="sm"
            @click="() => markAsRead(notification)"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </q-drawer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Notification } from 'shared/types/entities';
import { useNotificationsStore } from 'stores/notifications';
import { formatNotificationDate } from 'src/service/date';
import PriceAlertNotification from './PriceAlertNotification.vue';

export default defineComponent({
  name: 'NotificationsDrawer',
  components: {
    PriceAlertNotification,
  },
  emits: ['close-drawer'],
  props: {
    open: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const notificationsStore = useNotificationsStore();

    const markAsRead = (notification: Notification) => {
      const { id, unread } = notification;

      notificationsStore.markAsRead(id, !unread);
    };

    const getNotificationComponent = (notification: Notification) => {
      switch (notification.type) {
        case 'priceAlert':
          return PriceAlertNotification;
        default:
          return null;
      }
    };

    return {
      notificationsStore,
      formatNotificationDate,
      markAsRead,
      getNotificationComponent,
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
}
</style>
