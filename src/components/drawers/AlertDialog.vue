<template>
  <base-dialog
    :show="show"
    @close="$emit('close')"
    :on-submit="submitForm"
    :title="isNew ? 'Create Alert' : `Edit Alert`"
    :before-show="setLocalPlan"
  >
    <ticker-search
      :ticker="localAlert.ticker || ''"
      :disabled="!isNew"
      :ticker-meta="{
        display: localAlert.ticker,
        logo: localAlert.logoImage,
      }"
      @update:tickerValue="onTickerOptionSelect"
    />
  </base-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, toRef, Ref } from 'vue';
import { useLoadingStore } from 'stores/loading';
import { Alert } from 'app/shared/types';
import TickerSearch, { TickerOption } from 'components/common/TickerSearch.vue';
import BaseDialog from 'components/common/BaseDialog.vue';
import { useAlertsStore } from 'stores/alerts';

const emptyAlert = (): Alert => ({
  id: '',
  ticker: '',
  value: 0,
  active: true,
  once: true,
  logoImage: '',
  portfolioId: '',
  owner: '',
  expiration: Date.now(),
  condition: 'gt',
  valueProperty: 'regularMarketPrice',
});

export default defineComponent({
  name: 'AlertDialog',
  components: { BaseDialog, TickerSearch },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    alert: {
      type: Object as PropType<Alert | undefined>,
    },
  },
  emits: ['close'],
  setup(props) {
    const { emitLoadingTask } = useLoadingStore();
    const alertsStore = useAlertsStore();

    const localAlert = toRef(props.alert) as Ref<Alert>;

    const isNew = computed(() => localAlert?.value?.id === '');

    const setLocalPlan = () => {
      localAlert.value = {
        ...(props.alert || emptyAlert()),
      };
    };

    const submitForm = async () => {
      console.log('submitting form');
    };

    const onTickerOptionSelect = (tickerOption: TickerOption) => {
      localAlert.value.ticker = tickerOption?.value || '';
      localAlert.value.logoImage = tickerOption?.logoImage ?? '';
    };

    return {
      isNew,
      localAlert,
      setLocalPlan,
      submitForm,
      onTickerOptionSelect,
    };
  },
});
</script>
