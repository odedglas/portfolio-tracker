<template>
  <div class="col-12">
    <login-form :login-meta="loginMeta" />
    <social-media-login-bar />
    <sign-in-out-nav
      :login-meta="loginMeta"
      :switch-login-modes="switchLoginModes"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, computed } from 'vue';
import LoginForm from 'src/components/login/LoginForm.vue';
import SocialMediaLoginBar from 'src/components/login/SocialMediaLoginBar.vue';
import SignInOutNav from 'src/components/login/SignInOutNav.vue';
import { LOGIN_META } from 'src/constants';
import { LoginMode } from 'src/types';

export default defineComponent({
  name: 'LoginPage',

  components: {
    LoginForm,
    SocialMediaLoginBar,
    SignInOutNav,
  },

  setup() {
    const loginMode: Ref<LoginMode> = ref('login');
    const loginMeta = computed(() => LOGIN_META[loginMode.value]);

    const switchLoginModes = () =>
      (loginMode.value = loginMode.value === 'login' ? 'signUp' : 'login');

    return {
      loginMode,
      loginMeta,
      switchLoginModes,
    };
  },
});
</script>
