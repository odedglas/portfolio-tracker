<template>
  <q-card
    flat
    :bordered="appearanceStore.borderedCards"
    class="donut-holdings-chart"
  >
    <q-card-section class="q-pa-sm q-pa-md-lg q-mb-md q-mb-md-none">
      <div class="flex col justify-between">
        <div class="flex items-center q-mr-sm">
          <q-icon name="scale" class="dashboard-icon q-mr-sm" size="sm" />
          <p class="text-h6 text-grey-7 q-mb-none">Holdings allocation</p>

          <p
            v-if="showSectors"
            class="text-subtitle1 text-grey-7 q-mb-none q-mx-sm flex items-center q-gap-xs"
          >
            <q-icon name="arrow_forward_ios" size="xs" />
            <span class="clickable" @click="selectedSector = ''">Sectors</span>
            <q-icon v-if="selectedSector" name="arrow_forward_ios" size="xs" />
            <span v-if="selectedSector">{{ selectedSector }}</span>
          </p>
        </div>
        <q-icon class="clickable text-grey-7" name="more_horiz" size="sm">
          <q-menu>
            <q-list style="min-width: 250px">
              <q-item>
                <q-item-section>
                  <span>{{ $t('by_invested') }}</span>
                </q-item-section>
                <q-item-section side>
                  <q-toggle v-model="showInvested" />
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <span>{{ $t('by_sector') }}</span>
                </q-item-section>
                <q-item-section side>
                  <q-toggle v-model="showSectors" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-icon>
      </div>
    </q-card-section>
    <q-card-section class="row q-py-lg">
      <div class="col">
        <apexchart
          class="chart"
          :height="$q.platform.is.desktop ? 350 : 700"
          type="donut"
          :options="holdingsDonutData.options"
          :series="holdingsDonutData.series"
        ></apexchart>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { getHoldingsDonutChatOptions } from 'src/service/charts';
import { useNumberFormatter } from 'components/composables/useNumberFormatter';
import { useAppearanceStore } from 'stores/appearance';
import { useHoldingsStore } from 'stores/holdings';

export default defineComponent({
  name: 'HoldingsDonut',
  components: {
    apexchart: VueApexCharts,
  },
  setup() {
    const appearanceStore = useAppearanceStore();
    const holdingsStore = useHoldingsStore();

    const numberFormatter = useNumberFormatter();
    const showInvested = ref(false);
    const showSectors = ref(false);
    const selectedSector = ref('');

    const holdings = computed(() => {
      if (!showSectors.value) {
        return holdingsStore.portfolioHoldings;
      }

      if (selectedSector.value) {
        const sectorHoldings = holdingsStore.holdingsBySectors.find(
          (sector) => sector.name === selectedSector.value
        );

        return sectorHoldings?.holdings || [];
      }

      return holdingsStore.holdingsBySectors;
    });

    const holdingsDonutData = computed(() => {
      return getHoldingsDonutChatOptions(
        holdings.value,
        showInvested.value ? 'invested' : 'currentValue',
        numberFormatter,
        (name) => {
          if (showSectors.value && !selectedSector.value) {
            selectedSector.value = name;
          }
        }
      );
    });

    return {
      appearanceStore,
      showInvested,
      showSectors,
      selectedSector,
      holdingsDonutData,
    };
  },
});
</script>

<style lang="scss">
.donut-holdings-chart .chart {
  svg {
    overflow: visible;
  }

  .apexcharts-legend {
    @media (max-width: $breakpoint-sm-max) {
      justify-content: start !important;
    }
  }

  .apexcharts-legend-marker {
    margin-right: 12px;
  }

  .apexcharts-legend-series {
    display: flex;
    align-items: center;
    margin: 4px 6px !important;

    @media (max-width: $breakpoint-sm-max) {
      width: 100%;
    }

    .apexcharts-legend-text {
      flex: 1;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      color: $grey-7 !important;

      .percent {
        margin-left: 12px;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 11px;
        line-height: 11px;
        font-weight: 600;
        border: 1px solid $grey-9;
      }
    }
  }
}
</style>
