<template>
  <q-page-sticky position="bottom-right" :offset="[30, 40]">
    <q-btn
      color="primary"
      icon="calculate"
      round
      size="large"
      @click="showSimulator = true"
    >
    </q-btn>
  </q-page-sticky>
  <q-dialog v-model="showSimulator" backdrop-filter="blur(4px)">
    <q-card style="min-width: 700px">
      <q-card-section class="row items-center q-pa-none">
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title class="row items-center">
            <q-icon name="grading" class="q-mr-md" />
            Stocks Sell Simulator
          </q-toolbar-title>
          <q-btn flat round dense icon="close" @click="closeSimulator" />
        </q-toolbar>
      </q-card-section>
      <q-card-section>
        <div class="column" style="gap: 16px">
          <q-form ref="formRef" class="q-gap-sm">
            <q-select
              v-model="selectedEntry"
              @update:model-value="clearSimulatorResults"
              clearable
              lazy-rules
              :display-value="
                selectedEntry
                  ? `${selectedEntry?.name} | ${selectedEntry?.id}`
                  : ''
              "
              label="Select A Plan"
              :options="plans"
              :rules="[(val) => !!val || 'Please set a plan']"
            >
              <template v-slot:option="{ itemProps, opt }">
                <q-item v-bind="itemProps">
                  <q-item-section side>
                    <ticker-logo
                      :ticker="opt.name"
                      :logo-image="opt.logoImage"
                    />
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>{{ opt.name }} | {{ opt.id }}</q-item-label>
                    <q-item-label>
                      <q-item-label
                        caption
                        class="text-grey-7 row"
                        style="gap: 8px"
                      >
                        <span>
                          Granted On: {{ formatPlanDate(opt.grantDate) }}</span
                        >
                        <span>
                          Grant price:
                          {{ $n(opt.grantPrice, 'currency') }}</span
                        >
                        <span>
                          Available Amount:
                          {{ $n(opt.availableShares, 'fixedSensitive') }}</span
                        >
                      </q-item-label>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-slide-transition>
              <div
                class="rounded-borders q-card--bordered q-px-md q-py-sm"
                v-show="selectedEntry"
                v-if="selectedEntry"
              >
                <div class="row justify-between q-mb-sm">
                  <p class="text-caption q-mb-sm text-bold">Plan Details:</p>
                  <div>
                    <q-chip
                      outline
                      :icon="selectedEntry.is102Entitled ? 'check' : 'close'"
                      color="primary"
                      size="sm"
                      >102 Entitled?</q-chip
                    >
                    <q-chip
                      outline
                      :icon="
                        !!selectedEntry.terminationDate ? 'close' : 'check'
                      "
                      color="primary"
                      size="sm"
                      >Active Plan?</q-chip
                    >
                  </div>
                </div>
                <q-list class="text-caption">
                  <q-item class="q-pa-none">
                    <q-item-section>
                      <q-item-label class="text-grey-6"
                        >Grant Date</q-item-label
                      >
                      <q-item-label>{{
                        formatPlanDate(selectedEntry.grantDate)
                      }}</q-item-label>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-grey-6"
                        >Grant Price</q-item-label
                      >
                      <q-item-label>{{
                        $n(selectedEntry.grantPrice, 'currency')
                      }}</q-item-label>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-grey-6"
                        >Available Shares</q-item-label
                      >
                      <q-item-label>{{
                        $n(selectedEntry.availableShares ?? 0, 'fixedSensitive')
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item class="q-pa-none">
                    <q-item-section>
                      <q-item-label class="text-grey-6">Type</q-item-label>
                      <q-item-label class="text-uppercase">{{
                        selectedEntry.type
                      }}</q-item-label>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-grey-6"
                        >Vested Shares</q-item-label
                      >
                      <q-item-label class="text-uppercase">
                        {{ $n(selectedEntry.vested ?? 0, 'fixedSensitive') }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-grey-6"
                        >Sold Shares</q-item-label
                      >
                      <q-item-label>
                        {{
                          $n(selectedEntry.soldShares ?? 0, 'fixedSensitive')
                        }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </q-slide-transition>

            <q-input
              v-model.number="simulatorAmount"
              type="number"
              label="Shares Amount"
              lazy-rules
              :disable="!selectedEntry"
              :rules="[
                (val) =>
                  (val &&
                    val > 0 &&
                    val <= (selectedEntry?.availableShares ?? 0)) ||
                  `Simulation shares must be greater than 0 and lower than ${selectedEntry?.availableShares}`,
              ]"
            />

            <q-input
              v-model.number="simulatorPrice"
              type="number"
              suffix="$"
              :disable="!selectedEntry"
              lazy-rules
              :rules="[
                (val) => (val && val > 0) || 'Please enter a valid sell price',
              ]"
              label="Simulator Price"
            />

            <div class="flex justify-end">
              <q-toggle
                v-model="simulator102Entitled"
                :disable="!selectedEntry"
                label="Is 102 Entitled?"
              />
            </div>
          </q-form>
          <div v-if="showSimulatorResults">
            <div class="row q-px-md q-py-sm items-center text-caption">
              <span class="col" v-for="header in headers" :key="header">
                {{ header }}</span
              >
            </div>
            <q-list bordered>
              <q-item
                v-for="(result, usecase) in simulatorResults"
                :key="usecase"
                :class="`row text-caption simulator-results-row ${usecase}`"
              >
                <span
                  class="col flex items-center text-capitalize text-caption"
                >
                  <dynamic-image
                    :icon="result.logo"
                    extension="png"
                    class="q-mr-sm"
                    :size="24"
                  />
                  {{ usecase }}
                </span>
                <span class="col flex items-center">{{
                  $n(result.sellPrice, 'decimal')
                }}</span>
                <span class="col flex items-center">{{
                  $n(result.totalValue, 'currency')
                }}</span>
                <span class="col flex items-center">{{
                  $n(result.taxComponent, 'currency')
                }}</span>
                <span class="col flex items-center text-bold">{{
                  $n(result.capitalGain, 'currency')
                }}</span>
                <span class="col flex items-center text-bold">{{
                  $n(result.netGain, 'currency')
                }}</span>
              </q-item>
            </q-list>
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn :label="$t('close')" flat @click="closeSimulator" />
        <q-btn color="primary" :label="$t('calculate')" @click="simulateSell" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType, Ref, ref, watch } from 'vue';
import { formatPlanDate } from 'src/service/date';
import { StocksPlan } from 'app/shared/types';
import { calculateOrderGains } from 'src/service/stocksPlans';
import TickerLogo from 'components/common/TickerLogo.vue';
import DynamicImage from 'components/common/DynamicImage.vue';

type SimulatorPriceCase = 'bearish' | 'inline' | 'bullish';

type SimulatorResults = Record<
  SimulatorPriceCase,
  ReturnType<typeof calculateOrderGains> & {
    sellPrice: number;
    logo: string;
  }
>;

export default defineComponent({
  name: 'StocksPlanSimulator',
  components: { DynamicImage, TickerLogo },
  props: {
    plans: {
      type: Array as PropType<StocksPlan[]>,
      required: true,
    },
  },
  setup() {
    const showSimulator = ref(false);
    const simulatorResults: Ref<SimulatorResults | undefined> = ref(undefined);
    const showSimulatorResults = ref(false);
    const simulatorPrice = ref(0);
    const simulatorAmount = ref(0);
    const simulator102Entitled = ref(false);

    const formRef: Ref<{ validate: () => Promise<void> } | undefined> =
      ref(undefined);
    const selectedEntry: Ref<StocksPlan | undefined> = ref(undefined);

    const headers = [
      'Use Case',
      'Sell Price',
      'Total Value',
      'Tax Component',
      'Captial Gain',
      'Net Gain',
    ];

    watch(selectedEntry, (newPlan) => {
      simulatorPrice.value = newPlan?.marketPrice ?? 0;
      simulatorAmount.value = newPlan?.availableShares ?? 0;
      simulator102Entitled.value = newPlan?.is102Entitled ?? false;
    });

    watch([simulatorPrice, simulatorAmount, simulator102Entitled], () => {
      if (showSimulatorResults.value) {
        simulateSell();
      }
    });

    const simulateSell = async () => {
      const isValid = await formRef.value?.validate();
      const selectedPlan = selectedEntry.value;

      if (!isValid || !selectedPlan) {
        return;
      }

      const inlinePrice = simulatorPrice.value;
      const priceCases = [
        {
          case: 'target',
          price: inlinePrice,
          logo: 'target',
        },
        {
          case: 'bearish',
          price: inlinePrice * 0.85,
          logo: 'bear-market',
        },
        {
          case: 'bullish',
          logo: 'bull-market',
          price: inlinePrice * 1.35,
        },
      ];

      simulatorResults.value = priceCases.reduce((acc, current) => {
        acc[current.case as SimulatorPriceCase] = {
          ...calculateOrderGains({
            grantPrice: selectedPlan.grantPrice,
            isAbove102Entitlement: simulator102Entitled.value,
            isTerminated: !!selectedPlan.terminationDate,
            sellPrice: current.price,
            shares: simulatorAmount.value,
            type: selectedPlan.type,
          }),
          sellPrice: current.price,
          logo: current.logo,
        };

        return acc;
      }, {} as SimulatorResults);

      showSimulatorResults.value = true;
    };

    const clearSimulatorResults = () => {
      simulatorResults.value = undefined;
    };

    const closeSimulator = () => {
      showSimulator.value = false;
      selectedEntry.value = undefined;
      showSimulatorResults.value = false;
      clearSimulatorResults();
    };

    return {
      formRef,
      headers,
      selectedEntry,
      showSimulator,
      showSimulatorResults,
      simulatorPrice,
      simulatorAmount,
      simulator102Entitled,
      formatPlanDate,
      simulateSell,
      closeSimulator,
      simulatorResults,
      clearSimulatorResults,
    };
  },
});
</script>

<style lang="scss" scoped>
.simulator-results-row {
  &:not(:last-child) {
    border-bottom: 1px solid $grey-4;
  }

  &.bearish {
    background: linear-gradient(90deg, rgb(227 214 214) 0%, transparent 75%);
  }

  &.bullish {
    background: linear-gradient(90deg, rgb(198, 214, 194) 0%, transparent 75%);
  }

  &.target {
    background: linear-gradient(90deg, rgb(194, 202, 214) 0%, transparent 75%);
  }
}
</style>
