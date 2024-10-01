import { boot } from 'quasar/wrappers';
import numbersStealthFormatterPlugin from 'src/plugins/numbersStealthFormatterPlugin';

export default boot(async ({ app }) => {
  app.use(numbersStealthFormatterPlugin);
});
