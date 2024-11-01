<template>
  <q-btn :icon="visibilityIcon" flat @click="toggleStealthMode">
    <q-tooltip>{{ visibilityHelper }} all numeric values</q-tooltip>
  </q-btn>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useFeaturesStore } from 'stores/features';

export default defineComponent({
  name: 'StealthModeButton',
  setup() {
    const featuresStore = useFeaturesStore();

    const visibilityIcon = computed(() =>
      featuresStore.stealthMode ? 'visibility_off' : 'visibility'
    );
    const visibilityHelper = computed(() =>
      featuresStore.stealthMode ? 'Show' : 'Hide'
    );

    return {
      visibilityHelper,
      visibilityIcon,
      toggleStealthMode: featuresStore.toggleStealthMode,
    };
  },
});
</script>
