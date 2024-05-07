<template>
  <q-dialog v-model="show" backdrop-filter="blur(4px)">
    <q-card  style="min-width: 450px">
      <q-card-section class="row items-center q-pa-none">
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title class="row items-center ">
            <q-icon name="business_center" class="q-mr-md" />
            {{ isNew ? $t('portfolios.create') : $t('portfolios.edit') }}
          </q-toolbar-title>
          <q-space/>
          <q-btn
            flat
            round
            dense
            icon="close"
            @click="show = false"
          />
        </q-toolbar>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent.stop="() => console.log('Submitted')" class="q-gutter-sm">
          <q-input
            value="'email'"
            type="email"
            lazy-rules
            label="Email"
            :rules="[(val) => (val && val.length > 0) || 'Please enter a valid mail']"
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          :label="$t('cancel')"
          @click="show = false"
        />
        <q-btn
          color="primary"
          :label="$t('save')"
          @click="show = false"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import { Portfolio } from 'src/types';

export default defineComponent({
  name: 'PortfolioDialog',
  props: {
    portfolio: {
      type: Object as PropType<Partial<Portfolio>>,
    },
  },
  emits: ['closePortfolio'],
  setup(props, { emit }) {
    const show = computed({
      get: () => !!props.portfolio,
      set: (value: boolean) => {
        if (!value) {
          emit('closePortfolio', undefined);
        }
      },
    });

    const isNew = computed(() => props.portfolio?.id === 'new-portfolio');

    return {
      show,
      isNew
    };
  },
});
</script>
