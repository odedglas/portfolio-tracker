<template>
  <loading-layout />
  <router-view v-slot="{ Component }">
    <transition mode="out-in" name="page">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAuthenticationRedirectRoute } from 'src/router';
import { authentication } from 'src/service/firebase';
import LoadingLayout from './layouts/LoadingLayout.vue';

export default defineComponent({
  name: 'App',
  components: {
    LoadingLayout,
  },
  setup() {
    const router = useRouter();

    onMounted(() => {
      authentication.onAuthStateChanged(() => {
        const redirectRoute = getAuthenticationRedirectRoute(
          router.currentRoute.value.meta.authState
        );

        if (redirectRoute) {
          router.push(redirectRoute);
        }
      });
    });
  },
});
</script>
