<template>
  <q-page class="row justify-center q-pa-md">
    <div class="col-11">
      <p class="text-h5 text-grey-7 q-my-md">{{ $t('holdings.header') }}</p>
      <holdings-table />
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import HoldingsTable from 'components/holdings/HoldingsTable.vue';

export default defineComponent({
  name: 'HoldingsPage',
  components: {
    HoldingsTable,
  },

  setup() {
    return {};
  },
});
</script>
