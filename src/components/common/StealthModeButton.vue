<template>
  <q-btn :icon="visibilityIcon" flat @click="toggleStealthMode" :size="size">
    <q-tooltip v-if="$q.platform.is.desktop"
      >{{ visibilityHelper }} all numeric values</q-tooltip
    >
  </q-btn>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useFeaturesStore } from 'stores/features';

export default defineComponent({
  name: 'StealthModeButton',
  props: {
    size: {
      type: String,
      default: 'md',
    },
  },
  setup() {
    const featuresStore = useFeaturesStore();

    const visibilityIcon = computed(() =>
      featuresStore.stealthMode ? 'visibility' : 'visibility_off'
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
