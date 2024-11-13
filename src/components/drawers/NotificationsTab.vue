<template>
  <q-list
    class="notifications-list"
    v-if="notificationsStore.portfolioNotifications.length"
  >
    <q-item
      v-for="notification in notificationsStore.portfolioNotifications"
      :key="notification.id"
      :class="`notification column q-my-sm q-gap-sm ${
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
  <div
    v-else
    class="q-pa-lg text-grey-8 text-subtitle1 flex column items-center q-gap-lg"
  >
    There are no notifications yet...
    <img src="~assets/no-alarm.png" width="64" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Notification } from 'shared/types/entities';
import { useNotificationsStore } from 'stores/notifications';
import { formatNotificationDate } from 'src/service/date';
import PriceAlertNotification from './PriceAlertNotification.vue';

export default defineComponent({
  name: 'NotificationsTab',
  components: {
    PriceAlertNotification,
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
