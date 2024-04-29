<template>
  <q-layout>
    <q-page-container>
      <q-page class="q-pa-md q-my-md">
        Logo Goes Here
        <login-page />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { useRouter } from 'vue-router';
import LoginPage from 'src/pages/Login.vue';

export default {
  name: 'LoginLayout',
  components: {
    LoginPage,
  },
  setup() {
    const router = useRouter();
    const handleClick = () => {
      router.push('/dashboard');
    };

    return {
      handleClick,
    };
  },
};
</script>
