<template>
  <q-header elevated>
    <q-toolbar>
      <img class="header-logo q-mr-md" src="~assets/logo.svg" alt="app-logo"/>

      <q-toolbar-title class="row justify-between">
        <app-navigation class="desktop-only" />
      </q-toolbar-title>

      <q-btn-dropdown
        color="white"
        flat
        no-caps
        icon="business_center"
        label="My Portfolio"
      >
        <q-list style="min-width: 100px">
          <q-item clickable>
            <q-item-section>Having fun</q-item-section>
          </q-item>
          <q-item clickable>
            <q-item-section>Crazy for transitions</q-item-section>
          </q-item>
          <q-separator />
          <q-item clickable>
            <q-item-section>Mind blown</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>

      <q-avatar text-color="grey" color="white" class="text-subtitle1"
        >P</q-avatar
      >
    </q-toolbar>
  </q-header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppNavigation from './Navigation.vue';

export default defineComponent({
  name: 'AppHeader',
  components: {
    AppNavigation,
  },
});
</script>

<style lang="scss">
.header-logo {
  width: 225px;
}

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
