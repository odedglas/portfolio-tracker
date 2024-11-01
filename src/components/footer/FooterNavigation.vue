<template>
  <q-footer class="bg-primary text-white">
    <q-toolbar class="flex q-gap-md justify-center">
      <q-btn
        stack
        flat
        no-caps
        icon="home"
        label="Home"
        @click="onNavigationClick(ROUTE_PATHS.DASHBOARD)"
      />
      <q-btn stack flat no-caps icon="business_center" label="Portfolio" />
      <q-btn
        stack
        flat
        no-caps
        icon="bar_chart"
        label="Analytics"
        @click="onNavigationClick(ROUTE_PATHS.ANALYTICS)"
      />
      <q-btn stack flat no-caps icon="inventory" label="Stocks" />
    </q-toolbar>
  </q-footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { ROUTE_PATHS } from 'src/router/routes';

export default defineComponent({
  name: 'FooterNavigation',
  setup() {
    const router = useRouter();

    const onNavigationClick = (path: string) => {
      router.push(path);
    };

    return {
      onNavigationClick,
      ROUTE_PATHS,
    };
  },
});
</script>
