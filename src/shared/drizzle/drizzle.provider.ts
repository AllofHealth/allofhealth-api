import { Pool } from 'pg';
import type { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@/schemas/schema';

export const DRIZZLE_PROVIDER = 'DRIZZLE_PROVIDER';
export const drizzleProvider: Provider[] = [
  {
    provide: DRIZZLE_PROVIDER,
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      const uri = configService.get<string>('database.url');
      if (!uri) {
        throw new Error('Database URI is not defined, check config');
      }

      const pool = new Pool({
        connectionString: uri,
        max: 10,
        connectionTimeoutMillis: 50_000,
      });

      console.log('Attempting to connect to db');

      pool
        .connect()
        .then((client) => {
          client.release();
          console.log('Successfully connected to db');
        })
        .catch((error) => {
          console.error('Failed to connect to db', error);
        });
      return drizzle(pool, { schema });
    },
  },
];
