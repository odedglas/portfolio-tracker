<template>
  <div class="row items-center">
    <img
      v-if="logoImage"
      width="35"
      height="35"
      :src="logoImage"
      :alt="ticker"
    />
    <div class="empty-logo-alt flex items-center justify-center" v-else>
      <span class="ticker">{{ ticker }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TickerLogo',
  props: {
    ticker: { type: String, required: true },
    logoImage: {
      type: String,
      required: false,
    },
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
