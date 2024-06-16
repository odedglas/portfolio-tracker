<template>
  <q-dialog
    v-model="syntheticShow"
    backdrop-filter="blur(4px)"
    @before-show="setLocalPortfolio"
  >
    <q-card style="min-width: 450px">
      <q-card-section class="row items-center q-pa-none">
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title class="row items-center">
            <q-icon name="business_center" class="q-mr-md" />
            {{ isNew ? $t('portfolios.create') : $t('portfolios.edit') }}
          </q-toolbar-title>
          <q-space />
          <q-btn
            flat
            round
            dense
            icon="close"
            @click="$emit('closePortfolio')"
          />
        </q-toolbar>
      </q-card-section>

      <q-card-section>
        <q-form ref="formRef" class="q-gutter-sm">
          <q-input
            v-model="localPortfolio.title"
            type="text"
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
              (val) =>
                (val && val > 0) || 'Please enter your initial investment',
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
              (val) =>
                (val && val > 0) || 'Please enter your portfolio target value',
            ]"
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="$t('cancel')" @click="$emit('closePortfolio')" />
        <q-btn
          color="primary"
          type="submit"
          :label="$t('save')"
          @click="submitForm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, ref, toRef, Ref } from 'vue';
import { useLoadingStore } from 'stores/loading';
import { usePortfolioStore } from 'src/stores/portfolios';
import portfolioAPI, { viewTransformer } from 'src/service/portfolio';
import { Portfolio } from 'src/types';

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
  setup(props, { emit }) {
    const portfolioStore = usePortfolioStore();
    const { emitLoadingTask } = useLoadingStore();

    const formRef: Ref<{ validate: () => void } | undefined> = ref(undefined);
    const localPortfolio = toRef(props.portfolio) as Ref<Partial<Portfolio>>;

    const syntheticShow = computed({
      get: () => props.show,
      set: (value: boolean) => {
        if (!value) {
          emit('closePortfolio', undefined);
        }
      },
    });

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
      if (await formRef.value?.validate()) {
        await savePortfolio(localPortfolio.value as Portfolio);
        emit('closePortfolio');
      }
    };

    return {
      formRef,
      syntheticShow,
      isNew,
      initialDeposit,
      localPortfolio,
      viewTransformer,
      setLocalPortfolio,
      submitForm,
    };
  },
});
</script>
