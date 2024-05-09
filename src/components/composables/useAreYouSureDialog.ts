import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

interface AreYouSureDialogProps {
  title: string;
  message: string;
  callback?: () => Promise<unknown>;
}

export function useAreYouSure() {
  const $t = useI18n().t;
  const $q = useQuasar();

  const showAreYouSure = ({
    title,
    message,
    callback,
  }: AreYouSureDialogProps) => {
    $q.dialog({
      title,
      message,
      ok: {
        label: $t('yes'),
        color: 'primary',
      },
      cancel: {
        label: $t('no'),
        color: 'negative',
      },
    }).onOk(async () => {
      await callback?.();
    });
  };

  return { showAreYouSure };
}
