<template>
  <div class="col-12 q-mt-md">
    <div class="row q-gutter-md justify-center">
      <div v-for="provider in providers"
           :key="provider.id">

        <q-btn @click="providerLogin(provider)" :style="{ 'background-color': provider.color }">
          <DynamicImage :icon="provider.icon" classes="social-icon"/>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { APP } from '../../router/namedRoutes';
import { FIREBASE_LOGIN_PROVIDERS } from '../../service/provider/constants';
import DynamicImage from '../common/DynamicImage';
import auth from '../../service/authentication';

const providers = [
  { id: FIREBASE_LOGIN_PROVIDERS.GOOGLE, icon: 'gmail', color: '#B23121' },
  { id: FIREBASE_LOGIN_PROVIDERS.FACEBOOK, icon: 'facebook', color: '#3b5998' },
  { id: FIREBASE_LOGIN_PROVIDERS.TWITTER, icon: 'twitter', color: '#00acee ' },
];
export default {
  name: 'SocialMediaLoginBar',
  components: {
    DynamicImage,
  },
  computed: {
    providers() {
      return providers;
    },
  },
  methods: {
    async providerLogin(provider) {
      const { error } = await auth.loginWithProvider(provider.id);

      if (!error) {
        this.$router.push({ path: APP });
      } else {
        this.$q.notify({
          message: `Login with : ${provider.id} has failed :(`,
          color: 'negative',
          actions: [{ label: 'Dismiss', color: 'white' }],
        });
      }
    },
  },
};
</script>

<style lang="stylus">
  .social-icon
    svg
      color: white;
</style>
