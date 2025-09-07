import * as Sentry from '@sentry/nestjs';
import * as dotenv from 'dotenv';

dotenv.config();

Sentry.init({
  dsn: process.env.SENTRY_DSN!,

  enableLogs: true,
  tracesSampleRate: 1.0,
  sendDefaultPii: true,
});
