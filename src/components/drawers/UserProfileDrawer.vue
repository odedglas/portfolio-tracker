<template>
  <q-drawer
    :model-value="drawersStore.userProfileOpen"
    elevated
    :width="280"
    @hide="drawersStore.toggleUserProfile(false)"
    @show="drawersStore.toggleUserProfile(true)"
    side="left"
    overlay
    behavior="mobile"
  >
    <user-profile-list appearance="drawer" />
  </q-drawer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useDrawersStore } from 'stores/drawers';
import UserProfileList from 'components/header/UserProfileList.vue';

export default defineComponent({
  name: 'UserProfileDrawer',
  components: { UserProfileList },
  setup() {
    const drawersStore = useDrawersStore();

    return {
      drawersStore,
    };
  },
});
</script>
