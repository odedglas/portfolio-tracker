<template>
  <q-dialog
    v-model="syntheticShow"
    backdrop-filter="blur(4px)"
    @before-show="setLocalTransaction"
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
            @click="$emit('closeTransaction')"
          />
        </q-toolbar>
      </q-card-section>

      <q-card-section>
        <q-form ref="formRef" class="q-gutter-sm">
          <q-input
            v-model="localTransaction.price"
            type="text"
            lazy-rules
            label="Price"
            :rules="[
              (val) =>
                (val && val.length > 0) ||
                'Please enter a valid holdings price',
            ]"
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="$t('cancel')" @click="$emit('closeTransaction')" />
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
import { Transaction } from 'src/types';

const emptyTransaction = (): Transaction => ({
  id: '',
  action: 'buy',
  date: Date.now(),
  shares: 1,
  price: 10,
  fees: 0,
  ticker: '',
  portfolioId: '',
  name: '',
});

export default defineComponent({
  name: 'TransactionsDialog',
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    transaction: {
      type: Object as PropType<Partial<Transaction> | undefined>,
    },
  },
  emits: ['closeTransaction'],
  setup(props, { emit }) {
    const { emitLoadingTask } = useLoadingStore();

    const formRef: Ref<{ validate: () => void } | undefined> = ref(undefined);
    const localTransaction = toRef(props.transaction) as Ref<
      Partial<Transaction>
    >;

    const syntheticShow = computed({
      get: () => !!props.show,
      set: (value: boolean) => {
        if (!value) {
          emit('closeTransaction', undefined);
        }
      },
    });

    const isNew = computed(() => localTransaction?.value?.id === '');

    const setLocalTransaction = () => {
      localTransaction.value = {
        ...(props.transaction || emptyTransaction()),
      };
    };

    const saveTransaction = async (transaction: Transaction) => {
      let isNew = !transaction.id;

      console.log('Saving transaction', isNew);
      /*      const persisted = await emitLoadingTask(() =>
        portfolioAPI.update(portfolio, portfolio.id)
      );

      if (isNewPortfolio) {
        portfolioStore.add(persisted);
      } else {
        portfolioStore.update(persisted);
      }*/
    };

    const submitForm = async () => {
      if (await formRef.value?.validate()) {
        await saveTransaction(localTransaction.value as Transaction);
        emit('closeTransaction');
      }
    };

    return {
      formRef,
      syntheticShow,
      isNew,
      localTransaction,
      setLocalTransaction,
      submitForm,
    };
  },
});
</script>
