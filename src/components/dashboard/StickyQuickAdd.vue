<template>
  <q-page-sticky position="bottom-right" :offset="[30, 40]">
      <quick-add />
  </q-page-sticky>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import QuickAdd from 'components/dashboard/QuickAdd.vue';

export default defineComponent({
  name: 'StickyQuickAdd',
  components: { QuickAdd }
});
</script>
