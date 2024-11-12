<template>
  <div class="flex column q-gap-xs">
    <div class="flex justify-end text-grey-6">
      <q-btn round icon="add" size="sm" flat />
    </div>
    <q-separator />
    <q-list class="notifications-list">
      <div v-for="alert in alertsStore.portfolioAlerts" :key="alert.id">
        <q-item
          class="flex column q-gap-xs"
          @mouseenter="hoveredAlert = alert"
          @mouseleave="hoveredAlert = undefined"
        >
          <div class="flex justify-between">
            <span
              class="text-subtitle2 text-weight-regular flex items-center q-gap-sm"
            >
              {{ alert.ticker }} crossing {{ $n(alert.value ?? 0, 'decimal') }}
            </span>
            <span v-if="hoveredAlert"> Actions </span>
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
            <span :class="`flex ${alertStatusClass(alert)}`">
              <span>{{ alert.active ? 'Active' : 'Stopped' }}</span>
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
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useAlertsStore } from 'stores/alerts';
import { formatNotificationDate } from 'src/service/date';
import TickerLogo from 'components/common/TickerLogo.vue';
import { Alert } from 'app/shared/types';

export default defineComponent({
  name: 'AlertsTab',
  components: { TickerLogo },
  setup() {
    const hoveredAlert = ref<Alert | undefined>(undefined);
    const alertsStore = useAlertsStore();

    const alertStatusClass = (alert: Alert) => {
      if (alert.active) {
        return 'text-success';
      }

      if (alert.lastTriggeredDate) {
        return 'text-yellow-10';
      }

      return 'text-grey-7';
    };

    return {
      alertsStore,
      hoveredAlert,
      formatNotificationDate,
      alertStatusClass,
    };
  },
});
</script>
