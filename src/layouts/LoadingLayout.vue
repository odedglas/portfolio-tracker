<script lang="ts">
import { defineComponent, onUnmounted } from 'vue';
import { useQuasar, QSpinnerPie } from 'quasar';

export default defineComponent({
  name: 'LoadingLayout',
  setup() {
    const $q = useQuasar();

    $q.loading.show({
      spinnerColor: 'red',
      backgroundColor: 'white',
      spinner: QSpinnerPie,
    });

    onUnmounted(() => {
      $q.loading.hide();
    });
  },
});
</script>
