<template>
  <q-card flat :bordered="appearanceStore.borderedCards">
    <p class="text-body1 q-px-md q-pt-md q-mb-none">
      {{ $t('charts.benchmarks') }}:
    </p>
    <q-card-section
      class="row q-gap-md items-center benchmarks-selector-wrapper"
    >
      <div
        v-for="option in benchmarkOptions"
        :class="`q-px-md q-py-sm q-card--bordered clickable ${
          isActive(option) ? 'active' : ''
        }`"
        @click="() => toggleSelectedBenchmark(option)"
        :key="option.value"
      >
        {{ option.label }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, watch } from 'vue';
import { benchmarkOptions, Option } from 'components/analytics/constants';
import { useAppearanceStore } from 'stores/appearance';

export default defineComponent({
  name: 'BenchmarksSelector',
  emits: ['update:selectedBenchmark'],
  setup(_props, { emit }) {
    const appearanceStore = useAppearanceStore();
    const selectedBenchmark: Ref<Option[]> = ref([benchmarkOptions[0]]);

    const emitSelectedBenchmark = () => {
      emit(
        'update:selectedBenchmark',
        selectedBenchmark.value.map((v) => v.value)
      );
    };

    const isActive = (option: Option) =>
      selectedBenchmark.value.some((v) => v.value === option.value);

    const toggleSelectedBenchmark = (option: Option) => {
      if (isActive(option)) {
        selectedBenchmark.value = selectedBenchmark.value.filter(
          (v) => v.value !== option.value
        );
      } else {
        selectedBenchmark.value = [...selectedBenchmark.value, option];
      }

      selectedBenchmark.value = selectedBenchmark.value.sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      );

      emitSelectedBenchmark();
    };

    watch(selectedBenchmark, emitSelectedBenchmark, { immediate: true });

    return {
      appearanceStore,
      selectedBenchmark,
      benchmarkOptions,
      toggleSelectedBenchmark,
      isActive,
    };
  },
});
</script>

<style lang="scss">
.benchmarks-selector-wrapper {
  .active {
    border-color: $primary;
    color: $primary;
  }
}
</style>
