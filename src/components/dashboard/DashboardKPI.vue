<template>
  <q-card
    flat
    :bordered="appearanceStore.borderedCards"
    class="dashboard-kpi-card"
    @mouseleave="delayTooltipHide"
  >
    <q-card-section>
      <div class="row items-center no-wrap">
        <span class="flex q-mr-sm icon-wrapper">
          <q-icon :name="icon" size="medium" class="text-white" />
        </span>
        <div class="text-subtitle2 text-grey-9">{{ title }}</div>
      </div>
      <div class="flex items-center q-my-sm text-h4">
        <span ref="tooltipRef" @mouseenter="showKPITooltip = true">
          <span v-if="showValueSign">{{ valueSign }}</span>
          <span>
            {{ $n(Math.abs(value), 'decimal') }}
          </span>
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
      <q-menu
        anchor="bottom left"
        class="text-caption"
        v-if="tooltipRef && !!tooltip"
        @mouseenter.capture="() => {}"
        :target="tooltipRef"
        v-model="showKPITooltip"
      >
        <q-item
          v-for="[name, value] in Object.entries(tooltip)"
          :key="name"
          style="min-height: 32px"
        >
          <q-item-section>{{ $t(name) }}</q-item-section>
          <q-item-section side>
            <profit-indicator :value="value" show-value-sign />
          </q-item-section>
        </q-item>
      </q-menu>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, Ref, ref } from 'vue';
import ProfitIndicator from 'components/common/ProfitIndicator.vue';
import { useAppearanceStore } from 'stores/appearance';

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
    tooltip: {
      type: Object as PropType<Record<string, number | undefined>>,
      required: false,
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
    const tooltipRef: Ref<Element | null> = ref(null);
    const showKPITooltip = ref(false);
    const appearanceStore = useAppearanceStore();
    const valueSign = computed(() => (props.value >= 0 ? '+' : '-'));

    const delayTooltipHide = () => {
      setTimeout(() => {
        showKPITooltip.value = false;
      }, 200);
    };

    return {
      valueSign,
      appearanceStore,
      tooltipRef,
      showKPITooltip,
      delayTooltipHide,
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
