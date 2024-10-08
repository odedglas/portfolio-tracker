<template>
  <q-table
    flat
    bordered
    :rows="deposits"
    :columns="columns"
    row-key="name"
    :pagination="{ sortBy: 'date', descending: true }"
    :rows-per-page-options="[10, 15, 25, 0]"
    binary-state-sort
  >
    <template v-slot:top>
      <div class="flex items-center justify-between col">
        <q-btn
          outline
          icon="add"
          @click="addNewDeposit"
          color="primary"
          :label="$t('add')"
        />
      </div>
    </template>

    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td key="date" :props="props">
          {{ formatDate(props.row.date) }}
          <q-popup-edit
            :model-value="formatDate(props.row.date)"
            @update:modelValue="(value: number) => updateDeposit(value, 'date', props.row)"
            v-slot="scope"
          >
            <q-input
              v-model="scope.value"
              mask="date"
              dense
              autofocus
              @keyup.enter="scope.set"
            />
          </q-popup-edit>
        </q-td>
        <q-td key="action" :props="props">
          {{ props.row.action ?? '--' }}
          <q-popup-edit
            :model-value="props.row.action"
            @update:modelValue="
              (action) => updateDeposit(action.value, 'action', props.row)
            "
            v-slot="scope"
          >
            <q-select
              v-model="scope.value"
              dense
              :options="[
                { label: $t('deposit'), value: 'deposit' },
                { label: $t('withdrawal'), value: 'withdrawal' },
                { label: $t('balance'), value: 'balance' },
              ]"
              @keyup.enter="scope.set"
            />
          </q-popup-edit>
        </q-td>
        <q-td key="value" :props="props">
          {{ $n(props.row.value, 'currency') }}
          <q-popup-edit
            :model-value="props.row.value"
            @update:modelValue="(value: number) => updateDeposit(value, 'value', props.row)"
            v-slot="scope"
          >
            <q-input
              v-model.number="scope.value"
              dense
              autofocus
              @keyup.enter="scope.set"
            />
          </q-popup-edit>
        </q-td>
        <q-td key="notes" :props="props">
          {{ props.row.notes ?? '' }}
          <q-popup-edit
            :model-value="props.row.notes"
            @update:modelValue="(notes: string) => updateDeposit(notes, 'notes', props.row)"
            v-slot="scope"
          >
            <q-input
              v-model.number="scope.value"
              dense
              autofocus
              @keyup.enter="scope.set"
            />
          </q-popup-edit>
        </q-td>
        <q-td key="item_actions" :props="props" class="text-grey-6">
          <q-btn
            size="12px"
            flat
            dense
            round
            icon="delete"
            @click="() => $emit('deleteDeposit', props.row)"
          >
          </q-btn>
        </q-td>
      </q-tr>
    </template>

    <template v-slot:bottom-row>
      <q-tr class="text-bold text-center">
        <q-td colspan="1" class="text-left">
          <span>{{ $t('total') }}</span>
        </q-td>
        <q-td colspan="1"></q-td>
        <q-td colspan="1">
          {{ $n(totalCashFlow, 'currency') }}
        </q-td>
        <q-td colspan="1"></q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { usePortfolioStore } from 'stores/portfolios';
import { portfoliosTransformer } from 'app/shared/transformers';
import { date as dateUtils, type QTableProps } from 'quasar';
import { Deposit, DepositEntity } from 'app/shared/types';
import { useI18n } from 'vue-i18n';

const columns: QTableProps['columns'] = [
  {
    name: 'date',
    label: 'Date',
    align: 'left',
    field: 'date',
    sortable: true,
    required: true,
  },
  {
    name: 'action',
    align: 'center',
    label: 'Action',
    field: 'action',
    sortable: true,
  },
  {
    name: 'value',
    align: 'center',
    label: 'Amount',
    field: 'value',
    sortable: true,
    required: true,
  },
  {
    name: 'notes',
    align: 'center',
    field: 'notes',
    label: 'Notes',
    sortable: false,
  },
  {
    name: 'item_actions',
    align: 'right',
    label: '',
    field: 'none',
    sortable: false,
  },
];

export default defineComponent({
  name: 'CashFlowTable',
  setup(_props, { emit }) {
    const $t = useI18n().t;
    const portfolioStore = usePortfolioStore();
    const newDeposit = ref<DepositEntity | undefined>(undefined);
    const totalCashFlow = computed(() => {
      const portfolio = portfolioStore.selectedPortfolio;
      if (!portfolio) return 0;

      return portfoliosTransformer.cashFlow(portfolio);
    });

    const deposits = computed(() => {
      const portfolioDeposits =
        portfolioStore.selectedPortfolio?.deposits ?? [];

      const existingDeposits = portfolioDeposits.map(
        (portfolioDeposit, index) => ({
          ...portfolioDeposit,
          index,
          action: portfolioDeposit.type ? $t(portfolioDeposit.type) : '',
        })
      );

      return newDeposit.value
        ? [newDeposit.value, ...existingDeposits]
        : existingDeposits;
    });

    const formatDate = (date: number) =>
      dateUtils.formatDate(date, 'YYYY-MM-DD');

    const updateDeposit = (
      value: number | string | { value: string; label: string },
      field: 'value' | 'date' | 'notes' | 'action',
      deposit: DepositEntity
    ) => {
      if (field === 'value') {
        deposit.value = value as number;
      } else if (field === 'date') {
        deposit.date = new Date(value as string).getTime();
      } else if (field === 'notes') {
        deposit.notes = value as string;
      } else {
        deposit.type = value as Deposit['type'];
      }

      emit('editDeposit', deposit);

      if (deposit.index === newDeposit.value?.index) {
        newDeposit.value = undefined;
      }
    };

    const addNewDeposit = () => {
      if (!newDeposit.value) {
        newDeposit.value = {
          id: '',
          date: Date.now(),
          value: 0,
          index: deposits.value.length,
          type: 'deposit',
        };
      }
    };

    return {
      columns,
      portfolioStore,
      formatDate,
      totalCashFlow,
      deposits,
      updateDeposit,
      addNewDeposit,
    };
  },
  emit: ['deleteDeposit', 'editDeposit'],
});
</script>
