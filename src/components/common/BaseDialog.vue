<template>
  <q-dialog
    v-model="syntheticShow"
    :transition-show="transitions.show"
    :transition-hide="transitions.hide"
    :full-height="fullSizing"
    :full-width="fullSizing"
    class="base-dialog-wrapper"
    backdrop-filter="blur(4px)"
    @before-show="beforeShow"
  >
    <q-card style="min-width: 350px">
      <q-card-section class="row items-center q-pa-none">
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title class="row items-center">
            <q-icon name="transform" class="q-mr-md" />
            {{ title }}
          </q-toolbar-title>
          <q-btn flat round dense icon="close" @click="$emit('close')" />
        </q-toolbar>
      </q-card-section>

      <q-card-section>
        <q-form ref="formRef" class="column q-gap-lg">
          <slot />
        </q-form>
      </q-card-section>

      <slot name="additional-content" />

      <q-card-actions align="right" class="card-actions">
        <q-btn flat :label="$t('cancel')" @click="$emit('close')" />
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
import { defineComponent, computed, PropType, Ref, ref } from 'vue';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'BaseDialog',
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    beforeShow: {
      type: Function as PropType<(ev: Event) => void>,
      default: () => false,
    },
    onSubmit: {
      type: Function,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const $q = useQuasar();
    const formRef: Ref<{ validate: () => Promise<void> } | undefined> =
      ref(undefined);

    const syntheticShow = computed({
      get: () => props.show,
      set: (value: boolean) => {
        if (!value) {
          emit('close', undefined);
        }
      },
    });

    const transitions = computed(() => {
      return {
        show: $q.platform.is.mobile ? 'slide-up' : 'scale',
        hide: $q.platform.is.mobile ? 'slide-down' : 'scale',
      };
    });

    const fullSizing = computed(() => $q.platform.is.mobile);

    const submitForm = async () => {
      if (await formRef.value?.validate()) {
        props.onSubmit();

        emit('close');
      }
    };

    return {
      syntheticShow,
      transitions,
      fullSizing,
      formRef,
      submitForm,
    };
  },
});
</script>

<style lang="scss">
.base-dialog-wrapper {
  .q-dialog__inner {
    @media (max-width: $breakpoint-sm-max) {
      padding: 0;
    }
  }

  .card-actions {
    @media (max-width: $breakpoint-sm-max) {
      position: absolute;
      bottom: 0;
      right: 0;
    }
  }
}
</style>
