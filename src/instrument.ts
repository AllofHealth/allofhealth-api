import * as Sentry from '@sentry/nestjs';
import * as dotenv from 'dotenv';

dotenv.config();

Sentry.init({
  dsn: process.env.SENTRY_DSN!,

  debug: process.env.NODE_ENV === 'STAGING',
  environment: process.env.NODE_ENV || 'STAGING',

  enableLogs: true,
  tracesSampleRate: 1.0,
  sendDefaultPii: true,

  integrations: [
    Sentry.consoleLoggingIntegration({
      levels: ['log', 'info', 'warn', 'error', 'debug'],
    }),

    Sentry.httpIntegration(),

    Sentry.onUncaughtExceptionIntegration(),
    Sentry.onUnhandledRejectionIntegration(),
  ],

  beforeSend(event, hint) {
    if (process.env.NODE_ENV === 'STAGING') {
      console.log('Sending to Sentry:', event);
    }
    return event;
  },
});
