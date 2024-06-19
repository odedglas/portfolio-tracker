<template>
  <q-select
    use-input
    :modelValue="ticker"
    @update:model-value="(value) => $emit('update:tickerValue', value)"
    input-debounce="500"
    clearable
    :disable="disabled"
    lazy-rules
    label="Search Ticker"
    :display-value="
      tickerMeta?.display ? `${ticker} - ${tickerMeta?.display}` : ''
    "
    :options="options"
    @filter="filter"
    @popup-show="onTickerMenuShow"
    :rules="[(val) => (val && val.length > 0) || 'Please set a ticker']"
  >
    <template v-slot:option="{ itemProps, opt }">
      <q-item v-bind="itemProps">
        <q-item-section side>
          <ticker-logo :ticker="opt.value" :logo-image="opt.logoImage" />
        </q-item-section>
        <q-item-section side>
          <q-item-label>
            <q-item-label caption class="text-grey-5">{{
              opt.value
            }}</q-item-label>
            <q-item-label>{{ opt.label }}</q-item-label>
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>

    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey">
          {{ emptyText }}
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, computed, PropType } from 'vue';
import type { QSelectProps } from 'quasar';
import { useI18n } from 'vue-i18n';
import { getTickerData } from 'src/service/stocks';
import TickerLogo from './TickerLogo.vue';

export interface TickerOption {
  value: string;
  label: string;
  logoImage?: string;
  lastPrice?: number;
}

interface TickerMeta {
  display?: string;
  logo?: string;
}

export default defineComponent({
  name: 'TickerSearch',
  components: {
    TickerLogo,
  },
  props: {
    ticker: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: true,
    },
    tickerMeta: {
      type: Object as PropType<TickerMeta>,
      required: false,
    },
  },
  emits: ['update:tickerValue'],
  setup(props) {
    const $t = useI18n().t;
    const options: Ref<TickerOption[]> = ref([]);
    const noResults = ref(false);

    const filter: QSelectProps['onFilter'] = async (input, update) => {
      if (!input) {
        noResults.value = false;
        update(() => (options.value = []));
        return;
      }

      const search = await getTickerData(input);

      update(() => {
        noResults.value = search.length === 0;
        options.value = search.map((result) => ({
          ...result,
          label: result.shortname,
          value: result.symbol,
        }));
      });
    };

    const emptyText = computed(() =>
      noResults.value ? $t('no_results') : $t('transactions.search_ticker')
    );

    const onTickerMenuShow = () => {
      if (!options.value.length && props.tickerMeta?.display) {
        options.value = [
          {
            value: props.ticker,
            label: props.tickerMeta.display,
            logoImage: props.tickerMeta.logo,
          },
        ];
      }
    };

    return {
      emptyText,
      options,
      filter,
      onTickerMenuShow,
    };
  },
});
</script>
