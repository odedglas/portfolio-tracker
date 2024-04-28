<template>
  <router-view v-slot="{ Component }">
    <transition
      mode="out-in"
      name="page">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
});
</script>
