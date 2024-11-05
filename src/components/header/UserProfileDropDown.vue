<template>
  <q-avatar
    size="md"
    text-color="grey"
    color="white"
    class="text-subtitle2 clickable"
    >{{ userStore.initials }}
    <q-menu>
      <user-profile-list />
    </q-menu>
  </q-avatar>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useUserStore } from 'stores/user';
import UserProfileList from 'components/header/UserProfileList.vue';

export default defineComponent({
  name: 'UserProfileDropDown',
  components: { UserProfileList },
  setup() {
    const userStore = useUserStore();

    return {
      userStore,
    };
  },
});
</script>
