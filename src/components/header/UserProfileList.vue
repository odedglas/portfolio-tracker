<template>
  <q-list style="min-width: 200px" :class="`user-profile-list ${appearance}`">
    <q-item class="header">
      <q-item-section side>
        <q-avatar
          color="red-4"
          text-color="white"
          class="text-subtitle2"
          :size="avatarSize"
        >
          {{ userStore.initials }}
        </q-avatar>
      </q-item-section>
      <q-item-section class="user-details">
        <q-item-label>{{ userStore.displayName }}</q-item-label>
        <q-item-label caption :class="`${isDrawer ? 'text-white' : ''}`">{{
          userStore.user?.email
        }}</q-item-label>
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
    <slot />
    <q-separator />
    <q-item clickable v-close-popup @click="logout">
      <q-item-section side>
        <q-icon name="logout" />
      </q-item-section>
      <q-item-section> Logout </q-item-section>
    </q-item>
  </q-list>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { authentication } from 'src/service/firebase/authentication';
import { useUserStore } from 'stores/user';
import { usePortfolioStore } from 'stores/portfolios';
import { Portfolio } from 'app/shared/types';
import { useDrawersStore } from 'stores/drawers';

export default defineComponent({
  name: 'UserProfileList',
  props: {
    appearance: {
      type: String as PropType<'list' | 'drawer'>,
      default: 'list',
    },
  },
  setup(props) {
    const portfolioStore = usePortfolioStore();
    const drawersStroe = useDrawersStore();
    const userStore = useUserStore();

    const isDrawer = computed(() => props.appearance === 'drawer');
    const avatarSize = computed(() => (isDrawer.value ? 'xl' : 'lg'));

    const logout = () => authentication.signOut();

    const selectPortfolio = (portfolio: Portfolio) => {
      portfolioStore.selectPortfolio(portfolio.id);
      drawersStroe.toggleUserProfile();
    };

    return {
      portfolioStore,
      userStore,
      isDrawer,
      avatarSize,
      logout,
      selectPortfolio,
    };
  },
});
</script>

<style lang="scss">
.user-profile-list {
  &.drawer {
    .header {
      background-color: $primary;
      padding: 48px 8px;
      color: white;

      .user-details {
        font-size: 16px;
      }
    }
  }
}
</style>
