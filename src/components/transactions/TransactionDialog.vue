<template>
  <base-dialog
    :show="show"
    @close="$emit('close')"
    :on-submit="submitForm"
    :title="isNew ? $t('transactions.create') : $t('transactions.edit')"
    :before-show="setLocalTransaction"
  >
    <ticker-search
      :ticker="localTransaction.ticker || ''"
      :disabled="!isNew"
      :ticker-meta="{
        display: localTransaction.name,
        logo: localTransaction.logoImage,
      }"
      @update:tickerValue="onTickerOptionSelect"
    />

    <div class="row" style="gap: 12px">
      <q-select
        class="col text-capitalize"
        v-model="localTransaction.action"
        :disable="!isNew"
        :emit-value="true"
        :options="transactionActions"
        label="Operation"
      />

      <date-input
        :date="localTransaction.date"
        @date-change="(date) => (localTransaction.date = date)"
      />
    </div>

    <div class="row" style="gap: 12px">
      <q-input
        v-model.number="syntheticShares"
        class="col"
        type="text"
        lazy-rules
        :disable="!isNew"
        label="Shares"
        :rules="[
          (val) => (val && val > 0) || 'Please enter a valid amount of shares',
        ]"
      />

      <q-input
        v-model.number="localTransaction.price"
        class="col"
        type="text"
        lazy-rules
        suffix="$"
        label="Price"
        :rules="[
          (val) => (val && val > 0) || 'Please enter a valid holdings price',
        ]"
      />
    </div>

    <q-input
      v-model.number="localTransaction.fees"
      class="col"
      type="text"
      lazy-rules
      suffix="$"
      label="Fees"
    />

    <template v-slot:additional-content>
      <q-card-section>
        <span class="text-body-2 text-grey-6"
          >{{ $t('transactions.summary') }} -</span
        >
        <span class="text-grey-8 font-bold q-mx-sm">{{
          $n(totalTransaction, 'decimal')
        }}</span>
      </q-card-section>
    </template>
  </base-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, toRef, Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePortfolioStore } from 'stores/portfolios';
import { useTransactionsStore } from 'stores/transactions';
import { useLoadingStore } from 'stores/loading';
import { useQuotesStore } from 'stores/quotes';
import { Transaction } from 'app/shared/types';
import { TRANSACTIONS_TYPES } from 'app/shared/constants';
import TickerSearch, { TickerOption } from '../common/TickerSearch.vue';
import DateInput from 'components/common/DateInput.vue';
import BaseDialog from 'components/common/BaseDialog.vue';

const emptyTransaction = (): Transaction => {
  const selectedPortfolioId = usePortfolioStore().selectedPortfolio?.id;

  return {
    id: '',
    action: 'buy',
    date: Date.now(),
    createdAt: Date.now(),
    shares: 0,
    actualShares: 0,
    price: 0,
    fees: 0,
    ticker: '',
    portfolioId: selectedPortfolioId || '',
    name: '',
  };
};

export default defineComponent({
  name: 'TransactionsDialog',
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    transaction: {
      type: Object as PropType<Transaction | undefined>,
    },
  },
  components: {
    BaseDialog,
    DateInput,
    TickerSearch,
  },
  emits: ['close'],
  setup(props) {
    const $t = useI18n().t;
    const transactionsStore = useTransactionsStore();
    const quotesStore = useQuotesStore();
    const { emitLoadingTask } = useLoadingStore();

    const localTransaction = toRef(props.transaction) as Ref<Transaction>;

    const syntheticShares = computed({
      get: () => localTransaction.value.shares,
      set: (shares: number) => {
        localTransaction.value.shares = shares;
        localTransaction.value.actualShares = shares;
      },
    });

    const isNew = computed(() => localTransaction?.value?.id === '');

    const setLocalTransaction = () => {
      localTransaction.value = {
        ...(props.transaction || emptyTransaction()),
      };
    };

    const onTickerOptionSelect = (tickerOption: TickerOption) => {
      localTransaction.value.ticker = tickerOption?.value || '';
      localTransaction.value.name = tickerOption?.label;
      localTransaction.value.logoImage = tickerOption?.logoImage;
      localTransaction.value.price = tickerOption?.lastPrice ?? 0;
    };

    const submitForm = async () => {
      const transaction = localTransaction.value;

      await emitLoadingTask(async () => {
        const action = isNew.value
          ? transactionsStore.add
          : transactionsStore.update;

        await quotesStore.addTicker(transaction.ticker);

        await action(transaction);
      });
    };

    const transactionActions = Object.values(TRANSACTIONS_TYPES).map(
      (action) => ({
        value: action,
        label: $t(`transactions.${action}`),
      })
    );

    const totalTransaction = computed(() => {
      return (
        localTransaction.value.price * localTransaction.value.shares +
        (localTransaction.value.fees || 0)
      );
    });

    return {
      syntheticShares,
      isNew,
      localTransaction,
      setLocalTransaction,
      onTickerOptionSelect,
      submitForm,
      transactionActions,
      totalTransaction,
    };
  },
});
</script>
