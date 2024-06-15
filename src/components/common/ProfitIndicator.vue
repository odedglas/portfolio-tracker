<template>
  <span class="flex items-center" :class="textClass">
    <span v-if="value !== undefined">{{ $n(value, 'decimal') }}</span>
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
  },

  setup(props) {
    const icon = computed(() =>
      props.percentage >= 0 ? 'arrow_drop_up' : 'arrow_drop_down'
    );
    const textClass = computed(() =>
      props.percentage >= 0 ? 'text-green-6' : 'text-red-6'
    );

    return {
      icon,
      textClass,
    };
  },
});
</script>
