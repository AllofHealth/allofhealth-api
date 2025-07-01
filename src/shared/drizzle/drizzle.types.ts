import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from '@/schemas/schema';

export type Database = NodePgDatabase<typeof schema>;
