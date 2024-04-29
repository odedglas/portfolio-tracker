<template>
  <div class="col-12 q-mt-md">
    <div class="row q-gutter-md justify-center">
      <div v-for="provider in authProviders" :key="provider.id">
        <q-btn
          @click="providerLogin(provider)"
          :style="{ 'background-color': provider.color }"
        >
          <DynamicImage :icon="provider.icon" classes="social-icon" />
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { FIREBASE_LOGIN_PROVIDERS } from 'src/constants';
import DynamicImage from '../common/DynamicImage.vue';

const authProviders = [
  { id: FIREBASE_LOGIN_PROVIDERS.GOOGLE, icon: 'gmail', color: '#B23121' },
  { id: FIREBASE_LOGIN_PROVIDERS.FACEBOOK, icon: 'facebook', color: '#3b5998' },
  { id: FIREBASE_LOGIN_PROVIDERS.TWITTER, icon: 'twitter', color: '#00acee ' },
];
export default defineComponent({
  name: 'SocialMediaLoginBar',
  components: {
    DynamicImage,
  },

  setup() {
    const $q = useQuasar();
    const router = useRouter();

    const providerLogin = async (provider: { id: string }) => {
      const { error } = { error: true }; //await auth.loginWithProvider(provider.id);

      if (!error) {
        await router.push({ path: '/dashboard' });
      } else {
        $q.notify({
          message: `Login with : ${provider.id} has failed :(`,
          color: 'negative',
          actions: [{ label: 'Dismiss', color: 'white' }],
        });
      }
    };

    return {
      authProviders,
      providerLogin,
    };
  },
});
</script>
