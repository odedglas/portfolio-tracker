<template>
    <img v-if="iconSrc" :style="iconStyle" :class=classes :src="iconSrc" @click="imageClick" :alt="icon"/>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { getIcon } from 'src/service/icons';

export default defineComponent({
  name: 'DynamicImage',
  props: {
    icon: { type: String, required: true },
    click: Function,
    fullWidth: {
      type: Boolean, default: false,
    },
    classes: {
      type: String, default: '',
    },
    size: {
      type: Number, default: 24,
    },
  },

  setup(props) {
    const { icon } = props;
    const iconSrc = ref(getIcon(icon))

    const iconStyle = computed(() => {
      if (props.fullWidth) {
        return { width: '100%' };
      }

      const pxSize = `${props.size}px`;
      return { height: pxSize, width: pxSize };
    });

    const imageClick = () => {
      props.click?.();
    }

    return {
      iconSrc,
      iconStyle,
      imageClick,
    };
  },
});

</script>
