import { useI18n } from 'vue-i18n';
import { formatterStealthInterceptor } from 'src/plugins/numbersStealthFormatterPlugin';

export function useNumberFormatter() {
  const $n = useI18n().n;

  return formatterStealthInterceptor($n);
}
