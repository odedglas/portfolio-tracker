<template>
  <q-card flat bordered class="dashboard-kpi-card">
    <q-card-section>
      <div class="row items-center no-wrap">
        <span class="flex q-mr-sm icon-wrapper">
          <q-icon :name="icon" size="medium" class="text-white" />
        </span>
        <div class="text-subtitle2 text-grey-9">{{ title }}</div>
      </div>
      <div class="flex items-center q-my-sm text-h4">
        <span>
          {{ showValueSign ? `${valueSign} ${$n(Math.abs(value), 'decimal')}` : $n(value, 'decimal') }}
        </span>
        <profit-indicator
          v-if="valuePercentage"
          :percentage="valuePercentage"
          class="q-mx-sm text-subtitle1"
        />
      </div>
      <div class="flex items-center q-gutter-xs">
        <profit-indicator
          v-if="subtitle.percentage"
          :value="subtitle.value"
          :percentage="subtitle.percentage"
          class="q-mx-sm"
        />
        <span v-else :class="`${subtitle.className ?? 'text-grey-6'}`">
          {{ $n(subtitle?.value ?? 0, 'decimal') }}
        </span>
        <span class="text-grey-6">
          {{ subtitle.text }}
        </span>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import ProfitIndicator from 'components/common/ProfitIndicator.vue';

export default defineComponent({
  name: 'DashboardKpi',
  components: {
    ProfitIndicator,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    valuePercentage: {
      type: Number,
      required: false,
    },
    showValueSign: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      required: true,
    },
    subtitle: {
      type: Object as PropType<{
        text: string;
        value?: number;
        percentage?: number;
        className?: string;
      }>,
      required: true,
    },
  },
  setup(props) {
    const valueSign = computed(() => (props.value >= 0 ? '+' : '-'));

    return {
      valueSign,
    };
  },
});
</script>

<style lang="scss">
.dashboard-kpi-card {
  height: 100%;

  .icon-wrapper {
    background: lighten($primary, 15%);
    padding: 2px;
    border-radius: 4px;
  }
}
</style>
