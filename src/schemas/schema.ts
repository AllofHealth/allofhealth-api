import { PLACEHOLDER } from '@/shared/data/constants';
import {
  pgEnum,
  pgTable,
  uuid,
  varchar,
  date,
  text,
  jsonb,
  integer,
} from 'drizzle-orm/pg-core';

const ROLE_ENUM = pgEnum('role', [
  'DOCTOR',
  'PATIENT',
  'PHARMACIST',
  'INSTITUTE',
  'ADMIN',
]);

const STATUS_ENUM = pgEnum('status', ['PENDING', 'VERIFIED']);

export const user = pgTable('users', {
  id: uuid('id').notNull().primaryKey().unique().defaultRandom(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  emailAddress: varchar('email_address', { length: 255 }).notNull().unique(),
  dateOfBirth: date('date_of_birth').notNull(),
  gender: varchar('gender', { length: 10 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  profilePicture: text('profile_picture').default(PLACEHOLDER),
  password: varchar('password', { length: 255 }).notNull(),
  role: ROLE_ENUM('role').notNull().default('PATIENT'),
  status: STATUS_ENUM('status').notNull().default('PENDING'),
  createdAt: date('created_at').notNull().defaultNow(),
  updatedAt: date('updated_at').notNull().defaultNow(),
});

export const identity = pgTable('identities', {
  id: uuid('id').notNull().primaryKey().unique().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  role: ROLE_ENUM('role').notNull(),
  governmentId: text('government_id').notNull(),
  scannedLicense: text('scanned_license'),
});

export const doctors = pgTable('doctors', {
  id: uuid('id').notNull().primaryKey().unique().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  specialization: varchar('specialization', {
    length: 255,
  }).notNull(),
  medicalLicenseNumber: text('license_number').notNull(),
  licenseExpirationDate: date('license_expiration_date').notNull(),
  certifications: jsonb('certifications').default('[]'),
  hospitalAssociation: varchar('hospital_association', {
    length: 255,
  }).notNull(),
  locationOfHospital: varchar('location_of_hospital', {
    length: 255,
  }).notNull(),
  yearsOfExperience: integer('years_of_experience').notNull(),
  languagesSpoken: jsonb('languages_spoken').default('[]'),
});

export const accounts = pgTable('accounts', {
  id: uuid('id').notNull().primaryKey().unique().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  externalAddress: varchar('external_address', {
    length: 255,
  }).notNull(),
  smartWalletAddress: varchar('smart_wallet_address', {
    length: 255,
  }).notNull(),
  privateKey: varchar('private_key', {
    length: 255,
  }).notNull(),
});
