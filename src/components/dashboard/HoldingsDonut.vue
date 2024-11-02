<template>
  <q-card flat :bordered="bordered" class="donut-holdings-chart">
    <q-card-section class="q-pa-sm q-pa-md-lg q-mb-md q-mb-md-none">
      <div class="flex col justify-between">
        <div class="flex items-center q-mr-sm">
          <q-icon name="scale" class="dashboard-icon q-mr-sm" size="sm" />
          <p class="text-h6 text-grey-7 q-mb-none">Holdings allocation</p>
        </div>
        <q-toggle
          v-if="$q.platform.is.desktop"
          v-model="showInvested"
          label="By Invested"
        />
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
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'HoldingsDonut',
  components: {
    apexchart: VueApexCharts,
  },
  props: {
    bordered: {
      type: Boolean,
      default: true,
    },
  },
  setup() {
    const $q = useQuasar();
    const numberFormatter = useNumberFormatter();
    const showInvested = ref(false);

    const holdingsDonutData = computed(() => {
      return getHoldingsDonutChatOptions(
        showInvested.value ? 'invested' : 'currentValue',
        numberFormatter,
        $q.platform.is.desktop ? 'right' : 'bottom'
      );
    });

    return {
      showInvested,
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
