<template>
  <div class="navigation-buttons-container flex q-gutter-sm">
    <component
      v-for="button in navigationButtons"
      :key="button.id"
      :is="button.component"
      :class="navigationButtonClass(button.id)"
      @click="() => button.route && navigate(button.route)"
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
        route: '/',
        component: 'q-btn',
        props: { label: 'Dashboard' },
      },
      {
        id: 'manage-portfolio',
        props: { label: 'Portfolio' },
        component: 'q-btn',
        menuOptions: [
          {
            id: 'transactions',
            text: 'Transactions',
            icon: 'transform',
            route: '/transactions',
          },
          {
            id: 'holdings',
            text: 'Holdings',
            icon: 'cases',
            route: '/holdings',
          },
          {
            id: 'categories',
            text: 'Categories',
            icon: 'category',
            route: '/categories',
          },
          { id: 'events', text: 'Events', icon: 'event', route: '/events' },
        ],
      },
      {
        id: 'analytics',
        route: '/',
        component: 'q-btn',
        props: { label: 'Analytics' },
      },
      {
        id: 'stock-plants',
        route: '/',
        component: 'q-btn',
        props: { label: 'Stocks Plans' },
      },
    ];

    const isActiveRoute = (id: string) =>
      router.currentRoute.value.path.includes(id);

    const navigationButtonClass = (id: string) =>
      ['nav-btn', isActiveRoute(id) ? 'active' : ''].filter(Boolean).join(' ');

    const navigate = (routeId: string) => router.push(routeId);

    return {
      navigationButtons,
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
