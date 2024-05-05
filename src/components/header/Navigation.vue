<template>
  <div class="navigation-buttons-container flex q-gutter-sm">
    <q-btn
      v-for="button in navigationButtons"
      :key="button.id"
      :class="navigationButtonClass(button.id)"
      @click="() => navigate(button.route)"
      flat
      no-caps
      color="grey-4"
    >
      {{ button.text }}
    </q-btn>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'AppNavigation',
  setup() {
    const router = useRouter();

    const navigationButtons = [
      { id: 'dashboard', text: 'Dashboard', route: '/' },
      {
        id: 'manage-portfolio',
        text: 'Portfolio',
        route: '/manage-portfolios',
      },
      { id: 'analytics', text: 'Analytics', route: '/' },
      { id: 'stock-plants', text: 'Stock Plans', route: '/' },
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
