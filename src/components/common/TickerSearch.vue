<template>
  <q-select
    use-input
    :modelValue="ticker"
    @update:model-value="(value) => $emit('update:tickerValue', value)"
    input-debounce="300"
    clearable
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
          <img
            v-if="opt.logoImage"
            :src="opt.logoImage"
            :alt="opt.symbol"
            width="30"
          />
          <div class="empty-logo-alt flex items-center justify-center" v-else>
            <span class="ticker">{{ opt.value }}</span>
          </div>
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

export interface TickerOption {
  value: string;
  label: string;
  logoImage?: string;
}

interface TickerMeta {
  display?: string;
  logo?: string;
}

export default defineComponent({
  name: 'TickerSearch',
  props: {
    ticker: {
      type: String,
      required: true,
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
          label: result.name,
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

<style lang="scss">
.empty-logo-alt {
  height: 35px;
  width: 35px;
  border-radius: 5px;
  background-color: #f3f6f9;
  background-size: cover;

  .ticker {
    font-size: 0.6em;
    font-weight: 600;
  }
}
</style>
