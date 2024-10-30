<template>
  <q-avatar text-color="grey" color="white" class="text-subtitle1 clickable"
    >{{ userInitials }}
    <q-menu>
      <q-list style="min-width: 200px">
        <q-item>
          <q-item-section side>
            <q-avatar
              color="red-4"
              text-color="white"
              class="text-subtitle1"
              size="xl"
            >
              {{ userInitials }}
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ displayName }}</q-item-label>
            <q-item-label caption>{{ userStore.user?.email }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator />
        <q-item>
          <q-item-section>
            <q-toggle
              @click="userStore.toggleNotificationEnabledSetting"
              class="q-px-none"
              :model-value="userStore.user?.settings.notificationsEnabled"
              label="Enable Notifications"
              icon="notifications_none"
            />
          </q-item-section>
        </q-item>
        <q-separator />
        <q-item clickable v-close-popup @click="logout">
          <q-item-section side>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section> Logout </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-avatar>
</template>

<script lang="ts">
import { format } from 'quasar';
import { defineComponent, computed } from 'vue';
import { authentication } from 'src/service/firebase/authentication';
import { useUserStore } from 'stores/user';

const { capitalize } = format;

export default defineComponent({
  name: 'UserProfile',
  setup() {
    const userStore = useUserStore();

    const displayName = computed(() => {
      const userDisplayNameParts =
        userStore.user?.displayName?.split(' ') || [];

      return userDisplayNameParts.map(capitalize).join(' ');
    });

    const userInitials = computed(() => {
      const userDisplayNameParts =
        userStore.user?.displayName?.split(' ') || [];

      return userDisplayNameParts
        .map((part) => part.split('')[0].toUpperCase())
        .join('');
    });

    const logout = () => authentication.signOut();

    return {
      userStore,
      displayName,
      userInitials,
      logout,
    };
  },
});
</script>

<style lang="scss">
.navigation-buttons-container {
  .nav-btn:hover,
  .nav-btn.active {
    color: white !important;
  }

  .nav-btn.active {
    .q-focus-helper {
      background: currentColor;
      opacity: 0.15;
    }
  }
}
</style>
