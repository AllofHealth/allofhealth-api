import {
  boolean,
  date,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { PLACEHOLDER } from '@/shared/data/constants';

export const user = pgTable('users', {
  id: uuid('id').notNull().primaryKey().unique().defaultRandom(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  emailAddress: varchar('email_address', { length: 255 }).notNull().unique(),
  dateOfBirth: date('date_of_birth').notNull(),
  gender: varchar('gender', { length: 10 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  profilePicture: text('profile_picture').default(PLACEHOLDER),
  password: varchar('password', { length: 255 }).notNull(),
  role: text('role').notNull().default('PATIENT'),
  status: text('status').notNull().default('PENDING'),
  authProvider: varchar('auth_provider', { length: 255 }),
  createdAt: date('created_at').notNull().defaultNow(),
  updatedAt: date('updated_at').notNull().defaultNow(),
  lastLogin: timestamp('last_login', { withTimezone: true }),
  isFirstTime: boolean('is_first_time').default(true).notNull(),
  lastActivity: timestamp('last_activity', { withTimezone: true }),
  isOtpVerified: boolean('is_otp_verified').default(false).notNull(),
});

export const identity = pgTable('identities', {
  id: uuid('id').notNull().primaryKey().unique().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('PATIENT'),
  governmentFileId: varchar('government_file_id', { length: 255 }),
  governmentId: text('government_id'),
  scannedLicenseFileId: varchar('scanned_license_file_id', { length: 255 }),
  scannedLicense: text('scanned_license'),
  createdAt: date('created_at').notNull().defaultNow(),
  updatedAt: date('updated_at').notNull().defaultNow(),
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
  yearsOfExperience: integer('years_of_experience').default(1),
  languagesSpoken: jsonb('languages_spoken').default('[]'),
  availability: varchar('availability', {
    length: 255,
  }),
  lastLogin: timestamp('last_login', { withTimezone: true }),
  createdAt: date('created_at').notNull().defaultNow(),
  updatedAt: date('updated_at').notNull().defaultNow(),
  isFirstTime: boolean('is_first_time').default(true).notNull(),
  lastActivity: timestamp('last_activity', { withTimezone: true }),
  isVerified: boolean('is_verified').default(false).notNull(),
});

export const accounts = pgTable('accounts', {
  id: uuid('id').notNull().primaryKey().unique().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  externalAddress: varchar('external_address', {
    length: 255,
  }).notNull(),
  smartWalletAddress: varchar('smart_wallet_address', {
    length: 255,
  })
    .notNull()
    .unique(),
  privateKey: varchar('private_key', {
    length: 255,
  }).notNull(),
  createdAt: date('created_at').notNull().defaultNow(),
  updatedAt: date('updated_at').notNull().defaultNow(),
});

export const refresh_tokens = pgTable('refresh_tokens', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  userId: uuid('user')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' })
    .unique(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  replacedByToken: text('replaced_by_token'),
  updatedAt: date('updated_at').notNull().defaultNow(),
});

export const health_journal = pgTable('health_journal', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' })
    .unique(),
  mood: varchar('mood', { length: 255 }).notNull(),
  symptoms: jsonb('symptoms').default('[]'),
  activities: jsonb('activities').default('[]'),
  tags: jsonb('tags').default('[]'),
  createdAt: date('created_at').notNull().defaultNow(),
  updatedAt: date('updated_at').notNull().defaultNow(),
});

export const approvals = pgTable('approvals', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' })
    .unique(),
  practitionerAddress: varchar('practitioner_address', {
    length: 255,
  })
    .notNull()
    .references(() => accounts.smartWalletAddress, { onDelete: 'cascade' }),
  recordId: integer('recordId').default(0),
  duration: integer('duration').default(0),
  createdAt: date('created_at').notNull().defaultNow(),
  updatedAt: date('updated_at').notNull().defaultNow(),
  accessLevel: text('access_level').notNull().default('read'),
  isRequestAccepted: boolean().notNull().default(false),
});

export const admin = pgTable('admin', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  userName: varchar('user_name', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  permissionLevel: text('permission_level').notNull().default('system'),
  createdAt: date('created_at').defaultNow(),
  updatedAt: date('updated_at').defaultNow(),
});

export const records = pgTable('records', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' })
    .unique(),
  recordChainId: integer('record_chain_id').notNull().default(0),
  title: varchar('title', { length: 255 }).notNull(),
  recordType: jsonb('record_type').notNull().default('[]'),
  practitionerName: varchar('practitioner_name', { length: 255 }).notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: date('created_at').defaultNow(),
  updatedAt: date('updated_at').defaultNow(),
});

export const userRecordCounters = pgTable('user_record_counters', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  lastRecordChainId: integer('last_record_chain_id').notNull().default(0),
  createdAt: date('created_at').defaultNow(),
  updatedAt: date('updated_at').defaultNow(),
});
