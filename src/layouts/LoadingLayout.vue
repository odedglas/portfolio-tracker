<script lang="ts">
import { defineComponent, watch } from 'vue';
import { useQuasar, QSpinnerPie } from 'quasar';
import { useLoadingStore } from 'stores/loading';

export default defineComponent({
  name: 'LoadingLayout',
  setup() {
    const $q = useQuasar();
    const loadingStore = useLoadingStore();

    watch(
      () => loadingStore.loading,
      (loading) => {
        if (loading) {
          $q.loading.show({
            spinnerColor: 'red',
            backgroundColor: 'white',
            spinner: QSpinnerPie,
          });
        } else {
          $q.loading.hide();
        }
      }
    );
  },
});
</script>
