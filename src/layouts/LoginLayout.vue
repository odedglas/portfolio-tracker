<template>
  <q-layout>
    <q-page-container>
      <q-page class="q-pa-md q-my-md">
        <div class="column">
          <div
            class="col-3 text-center"
            v-bind:style="{ ['min-height']: '110px' }"
          ></div>
          <div class="col-9 row">
            <router-link to="/dashboard"> Login </router-link>
            <button @click="handleClick">Login</button>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { useRouter } from 'vue-router';

export default {
  name: 'LoginLayout',
  components: {},
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

