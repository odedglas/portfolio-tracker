<template>
  <span class="flex items-center" :class="textClass">
    {{ sign }}{{ $n(value, format) }}
  </span>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'NumericValue',
  props: {
    value: { type: Number, required: true },
    format: { type: String, default: 'currency' },
    displaySign: { type: Boolean, default: true },
  },

  setup(props) {
    const isPositive = computed(() => props.value >= 0);

    const icon = computed(() =>
      isPositive.value ? 'arrow_drop_up' : 'arrow_drop_down'
    );
    const textClass = computed(() =>
      isPositive.value ? 'text-green-6' : 'text-red-6'
    );
    const sign = computed(() => {
      if (!props.displaySign || props.value === 0) return '';

      return isPositive.value ? '+' : '';
    });

    return {
      icon,
      textClass,
      sign,
    };
  },
});
</script>
