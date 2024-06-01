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
            <q-icon name="transform" class="q-mr-md" />
            {{ isNew ? $t('transactions.create') : $t('transactions.edit') }}
          </q-toolbar-title>
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

            <q-input
              class="col"
              v-model="formattedDate"
              placeholder="Date"
              lazy-rules
              :rules="[
                (val) =>
                  (val && typeof new Date(val).getTime === 'function') ||
                  'Please set a valid transcation date',
              ]"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="formattedDate" mask="MM/DD/YYYY">
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
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
                (val) =>
                  (val && val > 0) || 'Please enter a valid amount of shares',
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
                (val) =>
                  (val && val > 0) || 'Please enter a valid holdings price',
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
        </q-form>
      </q-card-section>

      <q-card-section>
        <span class="text-body-2 text-grey-6"
          >{{ $t('transactions.summary') }} -</span
        >
        <span class="text-grey-8 font-bold q-mx-sm">{{
          $n(totalTransaction, 'decimal')
        }}</span>
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
import { date as dateUtils } from 'quasar';
import { useI18n } from 'vue-i18n';
import { usePortfolioStore } from 'stores/portfolios';
import { Transaction } from 'src/types';
import { TRANSACTIONS_TYPES } from 'src/constants';
import TickerSearch, { TickerOption } from '../common/TickerSearch.vue';

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
    TickerSearch,
  },
  emits: ['saveTransaction', 'closeTransaction'],
  setup(props, { emit }) {
    const $t = useI18n().t;

    const formRef: Ref<{ validate: () => Promise<void> } | undefined> =
      ref(undefined);
    const localTransaction = toRef(props.transaction) as Ref<Transaction>;

    const syntheticShow = computed({
      get: () => props.show,
      set: (value: boolean) => {
        if (!value) {
          emit('closeTransaction', undefined);
        }
      },
    });

    const formattedDate = computed({
      get: () =>
        dateUtils.formatDate(localTransaction.value.date, 'MM/DD/YYYY'),
      set: (date: string) => {
        localTransaction.value.date = new Date(date).getTime();
      },
    });

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
      if (await formRef.value?.validate()) {
        emit('saveTransaction', localTransaction.value as Transaction);
        emit('closeTransaction');
      }
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
      formRef,
      syntheticShow,
      syntheticShares,
      formattedDate,
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
