import { ref, UnwrapRef } from 'vue';
import { useAreYouSure } from './useAreYouSureDialog';
import { useLoadingStore } from 'stores/loading';
import { Entity } from 'app/shared/types';

interface UseEditableEntityPageProps<T> {
  deleteModal: {
    title: string;
    message: (entity: T) => string;
    callback: (entity: T) => Promise<unknown>;
  };
}

export function useEditableEntityPage<T extends Entity>({
  deleteModal,
}: UseEditableEntityPageProps<T>) {
  const { showAreYouSure } = useAreYouSure();
  const { emitLoadingTask } = useLoadingStore();

  const showModal = ref(false);
  const editEntity = ref<T | undefined>(undefined);

  const openEntityModal = async (entity?: T | undefined) => {
    const isEdit = !!entity?.id;
    if (isEdit) {
      editEntity.value = { ...(entity as UnwrapRef<T>) };
    }

    showModal.value = true;
  };

  const hideEntityModal = () => {
    editEntity.value = undefined;
    showModal.value = false;
  };

  const deleteEntity = (entity: T) => {
    showAreYouSure({
      title: deleteModal.title,
      message: deleteModal.message(entity),
      callback: async () => {
        await emitLoadingTask(() => deleteModal.callback(entity));
      },
    });
  };

  return {
    editEntity,
    showModal,
    openEntityModal,
    hideEntityModal,
    deleteEntity,
  };
}
