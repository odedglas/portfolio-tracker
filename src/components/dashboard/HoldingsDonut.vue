<template>
  <q-card class="q-mt-md" flat bordered>
    <q-card-section>
      <div class="flex col justify-between">
        <p class="text-h6 text-grey-8">Holdings</p>
        <q-toggle v-model="showInvested" label="Show Invested" />
      </div>
    </q-card-section>
    <q-card-section class="row q-py-lg">
      <div class="col-11">
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
    const $n = useI18n().n
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
.dashboard-kpi-card {
  height: 100%;
}
</style>
