<template>
  <div class="col-12 q-mt-md">
    <div class="row justify-center">
      <p>{{ $t(loginMeta.switchModeText) }}</p>
      <span
        :class="`q-mx-sm cursor-pointer text-${loginMeta.color}`"
        @click="switchLoginModes"
        >{{ $t(loginMeta.switchModeActionText) }}</span
      >
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { LOGIN_META } from 'src/constants';

export default defineComponent({
  name: 'SignInOutLink',
  props: {
    loginMeta: {
      type: Object as PropType<(typeof LOGIN_META)[keyof typeof LOGIN_META]>,
      required: true,
    },
    switchLoginModes: {
      type: Function as PropType<(payload: MouseEvent) => void>,
      required: true,
    },
  },
});
</script>
