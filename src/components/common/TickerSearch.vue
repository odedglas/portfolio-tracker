<template>
  <div class="q-pa-md">
    <div class="q-gutter-md row items-start">
      <q-select
        filled
        use-input
        dense
        v-model="model"
        input-debounce="300"
        clearable
        label="Search Ticker"
        :options="options"
        @filter="filter"
        style="width: 250px"
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
              <div
                class="empty-logo-alt flex items-center justify-center"
                v-else
              >
                <span class="ticker">{{ opt.symbol }}</span>
              </div>
            </q-item-section>
            <q-item-section side>
              <q-item-label>
                <q-item-label caption class="text-grey-5">{{
                  opt.symbol
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
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, computed } from 'vue';
import type { QSelectProps } from 'quasar';
import { useI18n } from 'vue-i18n';
import { getTickerData } from 'src/service/stocks';

interface TickerOptions {
  value: string;
  label: string;
}

export default defineComponent({
  name: 'TickerSearch',
  setup() {
    const $t = useI18n().t;
    const model = ref();
    const options: Ref<TickerOptions[]> = ref([]);
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

    return {
      model,
      emptyText,
      options,
      filter,
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
