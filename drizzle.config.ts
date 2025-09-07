import config from '@/shared/config/config';
import * as dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config();

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schemas/schema.ts',
  out: './drizzle/migrations',
  dbCredentials: {
    url:
      process.env.NODE_ENV === 'PRODUCTION'
        ? process.env.DATABASE_URL!
        : process.env.DATABASE_URL_STAGING!,
  },
  verbose: true,
  strict: true,
});
