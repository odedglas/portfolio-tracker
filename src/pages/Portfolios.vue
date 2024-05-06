<template>
  <q-page class="row justify-center q-pa-md">
    <div class="col-10">
      <h3 class="text-subtitle1 text-grey-7">
        {{ $t('portfolios.title') }}
      </h3>
      <portfolio-list
        :portfolios="portfolios"
        class="col-12"
        :edit-portfolio="createOrEditPortfolio"
        :delete-portfolio="deletePortfolio"
      />
      <div class="row justify-end q-my-md">
        <q-btn
          size="md"
          outline
          icon="add"
          class="text-primary"
          @click="() => createOrEditPortfolio()"
        >
          {{ $t('portfolios.create') }}
        </q-btn>
      </div>
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

    onMounted(async () => {
      portfolios.value = await collections.portfolio.all();
      console.log({ portfolios });
    });

    const createOrEditPortfolio = (portfolio?: Portfolio) => {
      console.log('Add Portfolio', portfolio);
      // TODO - Show Portfolio create/edit dialog
    };

    const deletePortfolio = (portfolio: Portfolio) => {
      console.log('Delete Portfolio', portfolio);
      // TODO - Are you sure display
    };

    return { portfolios, createOrEditPortfolio, deletePortfolio };
  },
});
</script>
