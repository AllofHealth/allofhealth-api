import { pgTable, uuid } from 'drizzle-orm/pg-core';

export const doctor = pgTable('doctors', {
  id: uuid('id').notNull().primaryKey().unique(),
});

export const patient = pgTable('patients', {
  id: uuid('id').notNull().primaryKey().unique(),
});
