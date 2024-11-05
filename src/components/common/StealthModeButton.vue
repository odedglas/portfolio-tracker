<template>
  <q-btn :icon="visibilityIcon" flat @click="toggleStealthMode" :size="size">
    <q-tooltip v-if="$q.platform.is.desktop"
      >{{ visibilityHelper }} all numeric values</q-tooltip
    >
  </q-btn>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useUserStore } from 'stores/user';

export default defineComponent({
  name: 'StealthModeButton',
  props: {
    size: {
      type: String,
      default: 'md',
    },
  },
  setup() {
    const userStore = useUserStore();

    const visibilityIcon = computed(() =>
      userStore.user?.settings.stealthModeEnabled
        ? 'visibility'
        : 'visibility_off'
    );
    const visibilityHelper = computed(() =>
      userStore.user?.settings.stealthModeEnabled ? 'Show' : 'Hide'
    );

    return {
      visibilityHelper,
      visibilityIcon,
      toggleStealthMode: userStore.toggleStealthMode,
    };
  },
});
</script>
