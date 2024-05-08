<template>
  <q-dialog
    v-model="show"
    backdrop-filter="blur(4px)"
    @before-show="setLocalPortfolio"
  >
    <q-card style="min-width: 450px">
      <q-card-section class="row items-center q-pa-none">
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title class="row items-center">
            <q-icon name="business_center" class="q-mr-md" />
            {{ isNew ? $t('portfolios.create') : $t('portfolios.edit') }}
          </q-toolbar-title>
          <q-space />
          <q-btn flat round dense icon="close" @click="show = false" />
        </q-toolbar>
      </q-card-section>

      <q-card-section>
        <q-form
          ref="formRef"
          @submit.prevent.stop="$emit('savePortfolio', localPortfolio)"
          class="q-gutter-sm"
        >
          <q-input
            v-model="localPortfolio.title"
            type="text"
            lazy-rules
            label="Title"
            :rules="[
              (val) => (val && val.length > 0) || 'Please enter a valid title',
            ]"
          />

          <q-input
            v-model="localPortfolio.invested"
            type="number"
            lazy-rules
            label="Initial Investment"
            suffix="$"
            :rules="[
              (val) =>
                (val && val > 0) || 'Please enter your initial investment',
            ]"
          />

          <q-input
            v-model="localPortfolio.target"
            type="number"
            lazy-rules
            label="Target"
            suffix="$"
            :rules="[
              (val) =>
                (val && val > 0) || 'Please enter your portfolio target value',
            ]"
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="$t('cancel')" @click="show = false" />
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
import { Portfolio } from 'src/types';

export default defineComponent({
  name: 'PortfolioDialog',
  props: {
    portfolio: {
      type: Object as PropType<Partial<Portfolio> | undefined>,
    },
  },
  emits: ['closePortfolio', 'savePortfolio'],
  setup(props, { emit }) {
    const formRef: Ref<{ validate: () => void } | undefined> = ref(undefined);
    const localPortfolio = toRef(props.portfolio) as Ref<Partial<Portfolio>>;

    const show = computed({
      get: () => !!props.portfolio,
      set: (value: boolean) => {
        if (!value) {
          emit('closePortfolio', undefined);
        }
      },
    });

    const isNew = computed(() => localPortfolio?.value?.id === 'new');

    const setLocalPortfolio = () => {
      localPortfolio.value = { ...props.portfolio };
    };

    const submitForm = () => {
      if (formRef.value?.validate()) {
        emit('savePortfolio', localPortfolio.value);
      }
    };

    return {
      formRef,
      show,
      isNew,
      localPortfolio,
      setLocalPortfolio,
      submitForm,
    };
  },
});
</script>
