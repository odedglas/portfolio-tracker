import path from 'path';
import { buildSync } from 'esbuild';

const dotenvConfig = require('dotenv').config().parsed;

buildSync({
  minify: true,
  bundle: true,
  entryPoints: [
    path.join(process.cwd(), 'src-pwa', 'firebase-messaging-sw.js'),
  ],
  outfile: path.join(process.cwd(), 'dist', 'pwa', 'firebase-messaging-sw.js'),
  define: {
    'process.env.MESSAGING_PK': `"${
      process.env.MESSAGING_PK ?? dotenvConfig.MESSAGING_PK
    }"`,
    'process.env.API_KEY': `"${process.env.API_KEY ?? dotenvConfig.API_KEY}"`,
    'process.env.AUTH_DOMAIN': `"${
      process.env.AUTH_DOMAIN ?? dotenvConfig.AUTH_DOMAIN
    }"`,
    'process.env.PROJECT_ID': `"${
      process.env.PROJECT_ID ?? dotenvConfig.PROJECT_ID
    }"`,
    'process.env.STORAGE_BUCKET': `"${
      process.env.STORAGE_BUCKET ?? dotenvConfig.STORAGE_BUCKET
    }"`,
    'process.env.APP_ID': `"${process.env.APP_ID ?? dotenvConfig.APP_ID}"`,
    'process.env.MESSAGING_SENDER_ID': `"${
      process.env.MESSAGING_SENDER_ID ?? dotenvConfig.MESSAGING_SENDER_ID
    }"`,
  },
});
