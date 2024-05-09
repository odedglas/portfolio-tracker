import { boot } from 'quasar/wrappers';
import { createI18n } from 'vue-i18n';

import { messages, currencies } from 'src/i18n';

// Type-define 'en-US' as the master schema for the resource
export type MessageSchema = (typeof messages)['en-US'];

/* eslint-disable @typescript-eslint/no-empty-interface */
declare module 'vue-i18n' {
  // define the locale messages schema
  export interface DefineLocaleMessage extends MessageSchema {}

  // define the datetime format schema
  export interface DefineDateTimeFormat {}

  // define the number format schema
  export interface DefineNumberFormat {}
}

export default boot(({ app }) => {
  const i18n = createI18n({
    locale: 'en-US',
    legacy: false,
    messages,
    numberFormats: currencies,
  });

  app.use(i18n);
});
