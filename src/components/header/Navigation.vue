<template>
  <div class="navigation-buttons-container flex q-gutter-sm">
    <component
      v-for="button in navigationButtons"
      :key="button.id"
      :is="button.component"
      :class="navigationButtonClass(button.route)"
      @click="() => !button.preventNavigation && navigate(button.route as string)"
      v-bind="button.props"
      flat
      no-caps
      color="grey-4"
    >
      <q-menu v-if="button.menuOptions">
        <q-item
          v-for="option in button.menuOptions"
          :key="option.id"
          clickable
          :active="isActiveRoute(option.route)"
          v-close-popup
          @click="() => navigate(option.route)"
        >
          <q-item-section side>
            <q-icon :name="option.icon" />
          </q-item-section>
          <q-item-section>{{ option.text }}</q-item-section>
        </q-item>
      </q-menu>
    </component>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { QBtn, QBtnDropdown, QMenu } from 'quasar';
import { ROUTE_PATHS } from 'src/router/routes';

export default defineComponent({
  name: 'AppNavigation',
  components: {
    QBtn,
    QBtnDropdown,
    QMenu,
  },
  setup() {
    const router = useRouter();

    const navigationButtons = [
      {
        id: 'dashboard',
        route: ROUTE_PATHS.DASHBOARD,
        component: 'q-btn',
        props: { label: 'Dashboard' },
      },
      {
        id: 'portfolio',
        props: { label: 'Portfolio' },
        component: 'q-btn',
        preventNavigation: true,
        route: [
          ROUTE_PATHS.TRANSACTIONS,
          ROUTE_PATHS.HOLDINGS,
          ROUTE_PATHS.CASH,
          ROUTE_PATHS.ALLOCATION_PLANNER,
        ],
        menuOptions: [
          {
            id: 'transactions',
            text: 'Transactions',
            icon: 'transform',
            route: ROUTE_PATHS.TRANSACTIONS,
          },
          {
            id: 'holdings',
            text: 'Holdings',
            icon: 'cases',
            route: ROUTE_PATHS.HOLDINGS,
          },
          {
            id: 'cash',
            text: 'Cash Flow',
            icon: 'attach_money',
            route: ROUTE_PATHS.CASH,
          },
          {
            id: 'planner',
            text: 'Allocation Planner',
            icon: 'list_alt',
            route: ROUTE_PATHS.ALLOCATION_PLANNER,
          },
        ],
      },
      {
        id: 'analytics',
        route: ROUTE_PATHS.ANALYTICS,
        component: 'q-btn',
        props: { label: 'Analytics' },
      },
      {
        id: 'stock-plans',
        route: ROUTE_PATHS.STOCK_PLANS,
        component: 'q-btn',
        props: { label: 'Stocks Plans' },
      },
    ];

    const isActiveRoute = (path: string | string[]) => {
      if (typeof path === 'string') {
        return router.currentRoute.value.path == path;
      }

      return path.includes(router.currentRoute.value.path);
    };

    const navigationButtonClass = (path: string | string[]) =>
      ['nav-btn', isActiveRoute(path) ? 'active' : '']
        .filter(Boolean)
        .join(' ');

    const navigate = (routeId: string) => router.push(routeId);

    return {
      navigationButtons,
      isActiveRoute,
      navigationButtonClass,
      navigate,
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
