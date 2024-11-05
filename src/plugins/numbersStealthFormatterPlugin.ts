import { App } from 'vue';
import { useUserStore } from 'stores/user';

export const NONE_SENSITIVE_FORMATTERS = [
  'percent',
  'fixed',
  'noneSensitiveDecimal',
];

export const formatterStealthInterceptor =
  (originalNumberFormatter: unknown) =>
  (value: number, ...args: unknown[]) => {
    const userStore = useUserStore();

    const [format] = args;

    const isNoneSensitiveFormat = NONE_SENSITIVE_FORMATTERS.includes(
      format as string
    );

    if (userStore.user?.settings.stealthModeEnabled && !isNoneSensitiveFormat) {
      const prefix =
        typeof format === 'string' && format.includes('fixed') ? '' : '$';

      return `${prefix}----`; // Return placeholder when stealth mode is enabled
    }

    // Otherwise, call the original formatter
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    return originalNumberFormatter.call(this, value, ...args);
  };

export default {
  install(app: App) {
    const originalNumberFormatter = app.config.globalProperties.$n;

    app.config.globalProperties.$n = formatterStealthInterceptor(
      originalNumberFormatter
    );
  },
};
