<template>
  <q-form @submit.prevent.stop="loginWithPassword" class="q-gutter-sm">
    <q-input
      filled
      v-model="email"
      type="email"
      lazy-rules
      label="Email"
      :rules="[(val) => (val && val.length > 0) || 'Please enter a valid mail']"
    />

    <transition
      appear
      enter-active-class="animated slideInLeft"
      leave-active-class="animated slideOutRight"
    >
      <q-input
        filled
        v-if="loginMeta?.isSignUp"
        type="text"
        v-model="displayName"
        label="Display Name"
        lazy-rules
        :rules="[
          (val) =>
            (val !== null && val !== '') || 'Please enter a valid display name',
        ]"
      />
    </transition>
    <q-input
      filled
      type="password"
      v-model="password"
      label="Password"
      lazy-rules
      :rules="[
        (val) =>
          (val !== null && val !== '') || 'Please enter a valid password',
      ]"
    />

    <q-btn
      :label="$t(loginMeta?.text ?? 'Login')"
      type="submit"
      class="full-width"
      :color="loginMeta?.color"
    />
  </q-form>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue';
import { LOGIN_META } from 'src/constants';

export default defineComponent({
  name: 'LoginForm',
  props: {
    loginMeta: {
      require: true,
      type: Object as PropType<(typeof LOGIN_META)[keyof typeof LOGIN_META]>,
    },
  },
  setup() {
    const email = ref('');
    const password = ref('');
    const displayName = ref('');

    const loginWithPassword = () => {
      // Authenticate with Passowrd.

      // Display error on failures.
      /*      $q.notify({
        message: !isSignUp.value ? 'Wrong email or password' : 'Provider Error',
        color: 'negative',
        actions: [{ label: 'Dismiss', color: 'white' }],
      })*/
      console.log('Login submit!!', { email, password, displayName });
    };

    return {
      email,
      password,
      displayName,
      loginWithPassword,
    };
  },
});
</script>
