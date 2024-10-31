<template>
  <base-dialog
    :show="show"
    @close="$emit('closePortfolio')"
    :on-submit="submitForm"
    :title="isNew ? $t('portfolios.create') : $t('portfolios.edit')"
    :before-show="setLocalPortfolio"
  >
    <q-input
      v-model="localPortfolio.title"
      type="text"
      class="q-pb-none"
      lazy-rules
      label="Title"
      :rules="[
        (val) => (val && val.length > 0) || 'Please enter a valid title',
      ]"
    />

    <q-input
      v-model.number="initialDeposit"
      type="number"
      lazy-rules
      :label="$t('portfolios.initial_investment')"
      :disable="!isNew"
      suffix="$"
      :hint="$t('portfolios.initial_value_explain')"
      :rules="[
        (val) => (val && val > 0) || 'Please enter your initial investment',
      ]"
    />

    <q-input
      v-model.number="localPortfolio.target"
      type="number"
      lazy-rules
      :label="$t('portfolios.target')"
      :hint="$t('portfolios.target_explain')"
      suffix="$"
      :rules="[
        (val) => (val && val > 0) || 'Please enter your portfolio target value',
      ]"
    />
  </base-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, toRef, Ref } from 'vue';
import { useLoadingStore } from 'stores/loading';
import { usePortfolioStore } from 'src/stores/portfolios';
import portfolioAPI from 'src/service/portfolio';
import { Portfolio } from 'app/shared/types';
import BaseDialog from 'components/common/BaseDialog.vue';

const emptyPortfolioTemplate = (): Portfolio => ({
  id: '',
  title: '',
  currentValue: 0,
  invested: 0,
  target: 0,
  profit: 0,
  owner: 'none',
  createdAt: Date.now(),
  deposits: [
    {
      value: 0,
      date: Date.now(),
      initial: true,
      type: 'deposit',
    },
  ],
});

export default defineComponent({
  name: 'PortfolioDialog',
  components: { BaseDialog },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    portfolio: {
      type: Object as PropType<Partial<Portfolio> | undefined>,
    },
  },
  emits: ['closePortfolio'],
  setup(props) {
    const portfolioStore = usePortfolioStore();
    const { emitLoadingTask } = useLoadingStore();

    const localPortfolio = toRef(props.portfolio) as Ref<Partial<Portfolio>>;

    const initialDeposit = computed({
      get: () => localPortfolio?.value?.deposits?.[0]?.value ?? 0,
      set: (value: number) => {
        localPortfolio.value.deposits ||= [];
        localPortfolio.value.deposits[0].value = value;
      },
    });

    const isNew = computed(() => localPortfolio?.value?.id === '');

    // Local portfolio value would be set to given props.portfolio or an empty one.
    const setLocalPortfolio = () => {
      localPortfolio.value = {
        ...(props.portfolio || emptyPortfolioTemplate()),
      };
    };

    const savePortfolio = async (portfolio: Portfolio) => {
      let isNewPortfolio = !portfolio.id;

      const persisted = await emitLoadingTask(() =>
        portfolioAPI.update(portfolio, portfolio.id)
      );

      if (isNewPortfolio) {
        portfolioStore.add(persisted);
      } else {
        portfolioStore.update(persisted);
      }
    };

    const submitForm = async () => {
      await savePortfolio(localPortfolio.value as Portfolio);
    };

    return {
      isNew,
      initialDeposit,
      localPortfolio,
      setLocalPortfolio,
      submitForm,
    };
  },
});
</script>
