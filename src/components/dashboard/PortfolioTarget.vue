<template>
  <q-card flat :bordered="appearanceStore.borderedCards" class="portfolio-target q-mt-lg">
    <q-card-section>
      <div class="flex items-center justify-between q-mb-md">
        <div class="flex items-center">
          <q-icon name="flag" class="dashboard-icon q-mr-sm" size="sm" />
          <span class="text-h6 text-grey-7">
            {{ year }} Goal: {{ $n(targetAmount, 'decimal') }}
          </span>
        </div>
        <span
          v-if="isReached"
          class="text-positive text-subtitle2 flex items-center q-gap-xs"
        >
          <q-icon name="emoji_events" size="sm" />
          Target reached!
        </span>
        <span v-else class="text-subtitle2 text-grey-6">
          {{ $n(displayValue, 'decimal') }} &middot; {{ displayPercentage }}%
        </span>
      </div>

      <div class="target-track-wrapper">
        <div class="target-track">
          <div
            class="target-track__fill bg-primary"
            :style="{ width: fillWidth }"
          />
        </div>

        <div
          v-for="milestone in milestones"
          :key="milestone.percentage"
          class="target-milestone"
          :style="{ left: milestone.percentage * 100 + '%' }"
        >
          <div
            class="target-milestone__dot"
            :class="milestone.reached ? 'bg-primary' : 'bg-grey-4'"
          />
          <span class="target-milestone__label text-caption text-grey-6">
            {{ abbreviate(milestone.value) }}
          </span>
        </div>

        <div
          v-if="!isReached"
          class="target-position"
          :style="{ left: fillWidth }"
        >
          <div class="target-position__dot bg-primary" />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useAppearanceStore } from 'stores/appearance';

export default defineComponent({
  name: 'PortfolioTarget',

  props: {
    targetAmount: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
  },

  setup(props) {
    const appearanceStore = useAppearanceStore();
    const isReached = computed(() => props.percentage >= 1);
    const fillWidth = computed(() => `${Math.min(props.percentage, 1) * 100}%`);
    const displayValue = computed(
      () => props.targetAmount * Math.min(props.percentage, 1)
    );
    const displayPercentage = computed(() =>
      (Math.min(props.percentage, 1) * 100).toFixed(1)
    );
    const milestones = computed(() =>
      [0.25, 0.5, 0.75, 1].map((p) => ({
        percentage: p,
        value: props.targetAmount * p,
        reached: props.percentage >= p,
      }))
    );

    const abbreviate = (val: number): string => {
      if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
      if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}k`;
      return `$${val}`;
    };

    return {
      appearanceStore,
      isReached,
      fillWidth,
      displayValue,
      displayPercentage,
      milestones,
      abbreviate,
    };
  },
});
</script>

<style lang="scss" scoped>
.portfolio-target {
  width: 100%;
}

.target-track-wrapper {
  position: relative;
  padding-bottom: 28px;
  margin: 0 8px;
}

.target-track {
  height: 8px;
  background: $grey-3;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.target-track__fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;
}

.target-milestone {
  position: absolute;
  top: -4px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.target-milestone__dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 0 1px $grey-4;
}

.target-milestone__label {
  margin-top: 4px;
  white-space: nowrap;
}

.target-position {
  position: absolute;
  top: -6px;
  transform: translateX(-50%);
  z-index: 1;
}

.target-position__dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
