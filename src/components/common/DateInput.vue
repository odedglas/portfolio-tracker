<template>
  <q-input
    class="col"
    v-model="formattedDate"
    placeholder="Date"
    lazy-rules
    :rules="[
      (val) =>
        (val && typeof new Date(val).getTime === 'function') ||
        'Please set a valid date',
    ]"
  >
    <template v-slot:append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date v-model="formattedDate" :mask="format">
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { date as dateUtils } from 'quasar';

export default defineComponent({
  name: 'DateInput',
  props: {
    date: {
      type: Number,
      required: true,
    },
    format: {
      type: String,
      default: 'MM/DD/YYYY',
    },
  },
  emits: ['date-change'],
  setup(props, { emit }) {
    const formattedDate = computed({
      get: () => dateUtils.formatDate(props.date, props.format),
      set: (date: string) => {
        emit('date-change', new Date(date).getTime());
      },
    });

    return {
      formattedDate,
    };
  },
});
</script>
