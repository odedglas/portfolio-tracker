<template>
  <div class="flex column q-gap-xs">
    <div class="flex justify-end text-grey-8">
      <q-btn round icon="add" size="sm" flat @click="() => openEntityModal()" />
    </div>
    <q-separator />
    <q-list class="notifications-list">
      <div v-for="alert in alertsStore.portfolioAlerts" :key="alert.id">
        <q-item
          class="flex column q-gap-sm"
          @mouseenter="hoveredAlert = alert"
          @mouseleave="hoveredAlert = undefined"
        >
          <div class="flex justify-between" style="min-height: 24px">
            <span class="text-subtitle2 text-weight-regular">
              {{ alert.ticker }} crossing {{ $n(alert.value ?? 0, 'decimal') }}
            </span>
            <span
              v-if="
                $q.platform.is.desktop ? hoveredAlert?.id === alert.id : true
              "
              class="flex text-grey-8 q-gap-xs"
            >
              <q-btn
                v-if="!alert.active"
                size="10px"
                flat
                dense
                round
                @click="() => alertsStore.toggleActive(alert.id)"
                icon="play_circle_outline"
              />
              <q-btn
                v-if="alert.active"
                size="10px"
                flat
                dense
                round
                @click="() => alertsStore.toggleActive(alert.id)"
                icon="pause_circle_outline"
              />
              <q-btn
                size="10px"
                flat
                dense
                round
                icon="edit"
                @click="() => openEntityModal(alert)"
              />
              <q-btn
                size="10px"
                flat
                dense
                round
                icon="delete"
                @click="() => deleteEntity(alert)"
              />
            </span>
          </div>
          <div class="flex row items-center q-gap-sm text-grey-7 text-caption">
            <div class="flex q-gap-xs">
              <ticker-logo
                :ticker="alert.ticker"
                :logo-image="alert.logoImage"
                :size="18"
              />
              {{ alert.ticker }}
            </div>
            <q-separator vertical />
            <span :class="`flex ${alertStatus(alert).className}`">
              <span>{{ alertStatus(alert).text }}</span>
              <span v-if="alert.lastTriggeredDate">&nbsp; - Triggered </span>
            </span>
            <q-separator v-if="alert.lastTriggeredDate" vertical />
            <span v-if="alert.lastTriggeredDate">
              {{ formatNotificationDate(alert.lastTriggeredDate) }}</span
            >
          </div>
        </q-item>
        <q-separator />
      </div>
    </q-list>
  </div>
  <alert-dialog
    :show="showModal"
    @close="hideEntityModal"
    :alert="editEntity"
  />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useAlertsStore } from 'stores/alerts';
import { formatNotificationDate } from 'src/service/date';
import TickerLogo from 'components/common/TickerLogo.vue';
import { Alert } from 'app/shared/types';
import AlertDialog from 'components/drawers/AlertDialog.vue';
import { useEditableEntityPage } from 'components/composables/useEditableEntityPage';

export default defineComponent({
  name: 'AlertsTab',
  components: { AlertDialog, TickerLogo },
  setup() {
    const hoveredAlert = ref<Alert | undefined>(undefined);
    const alertsStore = useAlertsStore();

    const {
      showModal,
      deleteEntity,
      hideEntityModal,
      editEntity,
      openEntityModal,
    } = useEditableEntityPage<Alert>({
      deleteModal: {
        title: 'Delete Alert',
        message: (alert) =>
          `Are you sure you want to remove this alert for "${alert.ticker}"?`,
        callback: (alert) => alertsStore.remove(alert.id),
      },
    });

    const alertStatus = (alert: Alert) => {
      if (alert.active) {
        return { className: 'text-green-7', text: 'Active' };
      }

      if (alert.lastTriggeredDate) {
        return { className: 'text-yellow-10', text: 'Stopped' };
      }

      return { className: 'text-grey-7', text: 'Manually Stopped' };
    };

    return {
      alertsStore,
      hoveredAlert,
      showModal,
      editEntity,
      openEntityModal,
      deleteEntity,
      hideEntityModal,
      formatNotificationDate,
      alertStatus,
    };
  },
});
</script>
