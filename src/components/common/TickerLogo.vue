<template>
  <div class="row items-center">
    <img
      v-if="logoImage"
      :src="logoImage"
      :style="computedStyle"
      :alt="ticker"
    />
    <div
      class="empty-logo-alt flex items-center justify-center"
      :style="computedStyle"
      v-else
    >
      <span class="ticker">{{ ticker }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'TickerLogo',
  props: {
    ticker: { type: String, required: true },
    logoImage: {
      type: String,
      required: false,
    },
    size: { type: Number, default: 35 },
  },
  setup(props) {
    const computedStyle = computed(() => ({
      width: `${props.size}px`,
      height: `${props.size}px`,
    }));

    return {
      computedStyle,
    };
  },
});
</script>

<style lang="scss">
.empty-logo-alt {
  border-radius: 5px;
  background-color: #f3f6f9;
  background-size: cover;

  .ticker {
    font-size: 0.6em;
    font-weight: 600;
  }
}
</style>
