<template>
  <q-header elevated>
    <q-toolbar>
      <q-btn flat dense round icon="menu_book" aria-label="Icon" />

      <q-toolbar-title> Portfolio Tracker </q-toolbar-title>

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

export default defineComponent({
  name: 'AppHeader',
});
</script>
