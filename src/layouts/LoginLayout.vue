<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center bg-grey-1">
        <login-page />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import LoginPage from 'src/pages/Login.vue';

export default {
  name: 'LoginLayout',
  components: {
    LoginPage,
  },
};
</script>
