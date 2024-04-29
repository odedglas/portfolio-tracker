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
      :label="$t(loginMeta.text ?? 'Login')"
      type="submit"
      class="full-width"
      :color="loginMeta.color"
    />
  </q-form>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue';
import { useQuasar } from 'quasar';
import { authentication } from 'src/service/firebase';
import { LOGIN_META } from 'src/constants';

export default defineComponent({
  name: 'LoginForm',
  props: {
    loginMeta: {
      required: true,
      type: Object as PropType<(typeof LOGIN_META)[keyof typeof LOGIN_META]>,
    },
  },
  setup(props) {
    const $q = useQuasar();
    const email = ref('');
    const password = ref('');
    const displayName = ref('');

    const loginWithPassword = async () => {
      const isSignUp = props.loginMeta?.isSignUp;

      try {
        const authenticationMethod = isSignUp
          ? authentication.signUp
          : authentication.signInWithPassword;

        await authenticationMethod(
          email.value,
          password.value,
          displayName.value
        );
      } catch (error) {
        $q.notify({
          message: !isSignUp
            ? 'Wrong email or password'
            : `Cannot Signup: ${(error as Error).message}`,
          color: 'negative',
          actions: [{ label: 'Dismiss', color: 'white' }],
        });
      }
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
