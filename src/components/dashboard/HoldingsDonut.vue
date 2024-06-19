<template>
  <q-card flat bordered class="donut-holdings-chart">
    <q-card-section class="q-px-lg">
      <div class="flex col justify-between">
        <div class="flex items-center q-mr-sm">
          <q-icon name="scale" class="text-grey-6 q-mr-sm" size="sm" />
          <p class="text-h6 text-grey-7 q-mb-none">Holdings allocation</p>
        </div>
        <q-toggle v-model="showInvested" label="By Invested" />
      </div>
    </q-card-section>
    <q-card-section class="row q-py-lg">
      <div class="col">
        <apexchart
          class="chart"
          height="350"
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
import { useI18n } from 'vue-i18n';
import { getHoldingsDonutChatOptions } from 'src/service/charts';

export default defineComponent({
  name: 'HoldingsDonut',
  components: {
    apexchart: VueApexCharts,
  },
  setup() {
    const $n = useI18n().n;
    const showInvested = ref(false);

    const holdingsDonutData = computed(() => {
      return getHoldingsDonutChatOptions(
        showInvested.value ? 'invested' : 'currentValue',
        $n
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

  .apexcharts-legend-marker {
    margin-right: 12px;
  }

  .apexcharts-legend-series {
    display: flex;
    align-items: center;
    margin: 4px 6px !important;

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
