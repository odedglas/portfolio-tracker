<template>
  <loading-layout v-if="loadingStore.loading" />
  <router-view v-slot="{ Component }">
    <transition mode="out-in" name="page">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import LoadingLayout from './layouts/LoadingLayout.vue';
import { getAuthenticationRedirectRoute } from 'src/router';
import { authentication } from 'src/service/firebase';
import { useLoadingStore } from 'stores/loading';

export default defineComponent({
  name: 'App',
  components: {
    LoadingLayout,
  },
  setup() {
    const router = useRouter();
    const loadingStore = useLoadingStore();

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

    return {
      loadingStore,
    };
  },
});
</script>
