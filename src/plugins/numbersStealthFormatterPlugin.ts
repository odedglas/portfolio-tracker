import { App } from 'vue';
import { useFeaturesStore } from 'stores/features';

export const formatterStealthInterceptor =
  (originalNumberFormatter: unknown) =>
  (value: number, ...args: unknown[]) => {
    const featuresStore = useFeaturesStore();

    const [format] = args;
    const isPercentage = ['percent', 'fixed'].includes(format as string);

    if (featuresStore.stealthMode && !isPercentage) {
      return '$----'; // Return placeholder when stealth mode is enabled
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
