<template>
  <q-item-section>
    <q-item-label class="text-subtitle2 flex items-center q-gap-sm">
      <ticker-logo
        :ticker="payload.ticker"
        :logo-image="payload.logo"
        :size="18"
      />
      {{ payload.ticker }} Is crossing above
      {{ $n(payload.targetPrice, 'decimal') }}
    </q-item-label>
  </q-item-section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { PriceAlertNotificationData } from 'app/shared/types';
import TickerLogo from 'components/common/TickerLogo.vue';

export default defineComponent({
  name: 'PriceAlertNotification',
  components: { TickerLogo },
  props: {
    payload: {
      type: Object as PropType<PriceAlertNotificationData>,
      required: true,
    },
  },
  setup() {
    return {};
  },
});
</script>
