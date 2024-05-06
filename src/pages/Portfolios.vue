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
import { useQuasar } from 'quasar';
import { useLoadingStore } from 'stores/loading';
import collections from 'src/service/firebase/collections';
import PortfolioList from 'src/components/portfolio/PortfolioList.vue';
import { Portfolio } from 'src/types';

export default defineComponent({
  name: 'PortfoliosPage',
  components: {
    PortfolioList,
  },
  setup() {
    const $q = useQuasar();
    const portfolios: Ref<Portfolio[]> = ref([]);
    const { emitLoadingTask } = useLoadingStore();

    onMounted(async () => {
      portfolios.value = await emitLoadingTask(() =>
        collections.portfolio.all()
      );
    });

    const createOrEditPortfolio = async (portfolio?: Portfolio) => {
      const isEdit = !!portfolio?.id;

      console.log('Add Portfolio', portfolio, isEdit);

      await collections.portfolio.update('123', {
        title: 'Other Portfolio',
        target: 10000,
        invested: 5000,
        currentValue: 7000,
        createdAt: Date.now(),
      });

      // TODO - Show Portfolio create/edit dialog
    };

    const deletePortfolio = (portfolio: Portfolio) => {
      $q.dialog({
        title: 'Delete Portfolio',
        message: `Are you sure you want to delete "${portfolio.title}"?`,
        ok: {
          label: 'Yes',
          color: 'primary',
        },
        cancel: {
          label: 'No',
          color: 'negative',
        },
      }).onOk(async () => {
        await emitLoadingTask(() => collections.portfolio.delete(portfolio.id));
      });
    };

    return { portfolios, createOrEditPortfolio, deletePortfolio };
  },
});
</script>
