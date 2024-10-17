<template>
  <img
    v-if="icon"
    :style="iconStyle"
    :class="classes"
    :src="`src/assets/dynamic/${icon}.${extension}`"
    @click="imageClick"
    :alt="icon"
  />
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'DynamicImage',
  props: {
    icon: { type: String, required: true },
    click: Function,
    fullWidth: {
      type: Boolean,
      default: false,
    },
    classes: {
      type: String,
      default: '',
    },
    size: {
      type: Number,
      default: 24,
    },
    extension: {
      type: String,
      default: 'svg',
    },
  },

  setup(props) {
    const iconStyle = computed(() => {
      if (props.fullWidth) {
        return { width: '100%' };
      }

      const pxSize = `${props.size}px`;
      return { height: pxSize, width: pxSize };
    });

    const imageClick = () => {
      props.click?.();
    };

    return {
      iconStyle,
      imageClick,
    };
  },
});
</script>
