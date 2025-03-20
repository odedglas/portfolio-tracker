<template>
  <q-page class="row justify-center q-pa-md">
    <div class="col-11">
      <p class="text-h5 text-grey-7 q-my-md">
        {{ $t('balance_history.title') }}
      </p>
      <balance-history />
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BalanceHistory from 'components/balanceHistory/BalanceHistory.vue';

export default defineComponent({
  name: 'BalancePage',
  components: {
    BalanceHistory,
  },
});
</script>
