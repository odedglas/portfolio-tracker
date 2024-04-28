<template>
  <div class="col-12 q-mt-md">
    <div class="row justify-center">
      <p>{{ $t(mode.sectionText) }}</p>
      <span :class="`q-mx-sm text-${mode.color}`" @click="click">{{ $t(mode.text) }}</span>
    </div>
  </div>
</template>

<script>

const MODES = {
  LOGIN: {
    text: 'login.login',
    color: 'primary',
    sectionText: 'login.have_an_account',
  },
  SIGNUP: {
    text: 'login.signup',
    color: 'secondary',
    sectionText: 'login.dont_have_account',
  },
};

export default {
  name: 'SignInOutLink',
  props: {
    signup: Boolean,
    sectionText: String,
    color: String,
  },
  computed: {
    mode() {
      return this.signup ? MODES.SIGNUP : MODES.LOGIN;
    },
  },
  methods: {
    click() {
      this.$router.push(this.mode.redirect);
    },
  },
};
</script>
