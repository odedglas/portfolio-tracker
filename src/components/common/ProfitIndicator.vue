<template>
  <span class="flex items-center" :class="textClass">
    <span v-if="value !== undefined">
      <span v-if="showValueSign"> {{ valueSign }} </span>
      {{ $n(Math.abs(value), 'decimal') }}
    </span>
    <q-separator v-if="showSeparator" vertical />
    <span class="flex items-center"
      ><q-icon :name="icon" size="sm" />{{ $n(percentage, 'percent') }}</span
    >
  </span>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'ProfitIndicator',
  props: {
    value: { type: Number, required: false },
    percentage: { type: Number, required: true },
    displayAsRow: { type: Boolean, default: true },
    showValueSign: { type: Boolean, default: false },
    showSeparator: { type: Boolean, default: false },
  },

  setup(props) {
    const valueSign = computed(() => ((props?.value ?? 0) >= 0 ? '+' : '-'));

    const isProfitable = computed(
      () => (props.value ? props.value : props.percentage) >= 0
    );

    const icon = computed(() =>
      isProfitable.value ? 'arrow_drop_up' : 'arrow_drop_down'
    );
    const textClass = computed(() =>
      [
        isProfitable.value ? 'text-green-6' : 'text-red-6',
        props.displayAsRow ? 'row' : 'column',
      ].join(' ')
    );

    return {
      icon,
      textClass,
      valueSign,
    };
  },
});
</script>
