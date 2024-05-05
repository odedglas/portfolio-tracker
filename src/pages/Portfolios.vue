<template>
  <q-page class="q-pa-md">
    <div class="row">
      <h3 class="text-subtitle1 text-grey-7">
        {{ $t('portfolios.title') }}
      </h3>
      <portfolio-list :portfolios="portfolios" class="col-12" />
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, Ref } from 'vue';
import collections from 'src/service/firebase/collections';
import PortfolioList from 'src/components/portfolio/PortfolioList.vue';
import { Portfolio } from 'src/types';
export default defineComponent({
  name: 'PortfoliosPage',
  components: {
    PortfolioList,
  },
  setup() {
    const portfolios: Ref<Portfolio[]> = ref([]);
    // TODO - Get all Portfolios - Display
    onMounted(async () => {
      portfolios.value = await collections.portfolio.all();
      console.log({ portfolios });
    });

    // TODO - Option to add portfolio

    return { portfolios };
  },
});
</script>
