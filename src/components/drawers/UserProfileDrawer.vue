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
    <user-profile-list appearance="drawer">
      <q-separator />
      <q-item class="flex column">
        <p class="text-subtitle1 q-mb-sm">Portfolios:</p>
        <q-list>
          <q-item
            clickable
            v-close-popup
            v-for="portfolio in portfolioStore.portfoliosWithHoldings"
            :key="portfolio.id"
            @click="selectPortfolio(portfolio)"
            :active="portfolio.id === portfolioStore.selectedPortfolioId"
          >
            <q-item-section>
              <q-item-label>{{ portfolio.title }}</q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-item-label caption>{{
                $n(portfolio.currentValue, 'currency')
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-item>
    </user-profile-list>
  </q-drawer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useDrawersStore } from 'stores/drawers';
import UserProfileList from 'components/header/UserProfileList.vue';
import { Portfolio } from 'app/shared/types';
import { usePortfolioStore } from 'stores/portfolios';

export default defineComponent({
  name: 'UserProfileDrawer',
  components: { UserProfileList },
  setup() {
    const portfolioStore = usePortfolioStore();
    const drawersStore = useDrawersStore();

    const selectPortfolio = (portfolio: Portfolio) => {
      portfolioStore.selectPortfolio(portfolio.id);
      drawersStore.toggleUserProfile();
    };

    return {
      drawersStore,
      portfolioStore,
      selectPortfolio,
    };
  },
});
</script>
