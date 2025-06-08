import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/schemas/schema';

export type Database = NodePgDatabase<typeof schema>;
