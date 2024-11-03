<template>
  <q-card flat>
    <q-card-section class="q-pb-none">
      <span class="text-subtitle2">{{ title }}</span>
    </q-card-section>
    <q-card-section class="q-px-none q-py-sm">
      <q-list separator>
        <q-item
          v-for="item in items"
          :key="item.title"
          clickable
          @click="$emit('item-click', item.rawEntity)"
        >
          <q-item-section side>
            <ticker-logo
              v-if="item.ticker"
              :ticker="item.ticker.symbol"
              :logoImage="item.ticker?.logoImage"
            />
            <q-icon v-if="item.icon" :name="item.icon" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-subtitle1 text-capitalize">{{
              item.title
            }}</q-item-label>
            <q-item-label v-if="item.subtitle" class="text-subtitle2">{{
              item.subtitle
            }}</q-item-label>
            <q-item-label
              v-if="item.caption"
              class="text-caption text-grey-7"
              >{{ item.caption }}</q-item-label
            >
          </q-item-section>

          <q-item-section side class="flex justify-between q-gap-sm">
            <q-item-label class="text-caption text-grey-7" v-if="item.date">{{
              formatShortDate(item.date)
            }}</q-item-label>
            <q-item-label
              class="text-caption text-grey-7"
              v-if="item.dateLabel"
              >{{ item.dateLabel }}</q-item-label
            >
            <q-item-label class="text-subtitle2 text-black">
              <profit-indicator
                :value="item.value"
                show-value-sign
                :percentage="item.percent"
                :display-as-row="false"
              />
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item class="flex justify-between">
          <q-item-section>
            <q-item-label class="text-grey-7">Total</q-item-label>
          </q-item-section>
          <q-item-section class="text-align-end">
            <q-item-label>{{ $n(totalValue, 'decimal') }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { formatShortDate } from 'src/service/date';
import ProfitIndicator from 'components/common/ProfitIndicator.vue';
import TickerLogo from 'components/common/TickerLogo.vue';
import { Entity } from 'app/shared/types';

type ListItem = {
  title: string;
  subtitle?: string;
  caption?: string;
  icon?: string;
  date?: number;
  dateLabel?: string;
  value: number;
  percent?: number;
  ticker?: {
    symbol: string;
    logoImage?: string;
  };
  rawEntity?: Entity;
};

export default defineComponent({
  name: 'MobileAbstractList',
  components: { TickerLogo, ProfitIndicator },
  props: {
    title: {
      type: String,
      required: true,
    },
    items: {
      type: Array as PropType<ListItem[]>,
      required: true,
    },
  },
  emits: ['item-click'],
  setup(props) {
    const totalValue = computed(() =>
      props.items.reduce((acc, item) => acc + item.value, 0)
    );

    return {
      formatShortDate,
      totalValue,
    };
  },
});
</script>
