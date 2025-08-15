import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
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
  bio: varchar('bio', { length: 255 }),
  medicalLicenseNumber: text('license_number').notNull(),
  licenseExpirationDate: date('license_expiration_date').notNull(),
  certifications: jsonb('certifications').default('[]'),
  servicesOffered: jsonb('services_offered').default('["consultation"]'),
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
  isVerified: boolean('is_verified').default(true).notNull(),
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
    .references(() => user.id, { onDelete: 'cascade' }),
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
    .references(() => user.id, { onDelete: 'cascade' }),
  practitionerAddress: varchar('practitioner_address', {
    length: 255,
  })
    .notNull()
    .references(() => accounts.smartWalletAddress, { onDelete: 'cascade' }),
  userHealthInfoId: uuid('user_health_info_id').references(
    () => healthInformation.id,
    { onDelete: 'cascade' },
  ),
  recordId: integer('recordId').default(0),
  duration: integer('duration').default(0),
  createdAt: date('created_at').notNull().defaultNow(),
  updatedAt: date('updated_at').notNull().defaultNow(),
  accessLevel: text('access_level').notNull().default('read'),
  isRequestAccepted: boolean().notNull().default(false),
  status: text('status').notNull().default('created'),
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
    .references(() => user.id, { onDelete: 'cascade' }),
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

export const healthInformation = pgTable('health_information', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' })
    .unique(),
  howAreYouFeeling: varchar('how_are_you_feeling', { length: 255 }).notNull(),
  whenDidItStart: varchar('when_did_it_start', { length: 255 }).notNull(),
  painLevel: text('pain_level').notNull().default('mild'),
  knownConditions: jsonb('known_conditions').notNull().default('[]'),
  medicationsTaken: jsonb('medications_taken').notNull().default('[]'),
  attachment: text('attachment').default(''),
  attachmentFileId: text('attachment_file_id').default(''),
  createdAt: date('created_at').defaultNow(),
  updatedAt: date('updated_at').defaultNow(),
});

export const dailyReward = pgTable('daily_reward', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  dailyTaskCount: integer('daily_task_count').notNull().default(1),
  isTokenMinted: boolean('is_token_minted').notNull().default(false),
  createdAt: date('created_at').defaultNow(),
  updatedAt: date('updated_at').defaultNow(),
});

export const otp = pgTable('otp', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  emailAddress: varchar('email_address', { length: 255 }).notNull().unique(),
  otpCode: varchar('otp_code', { length: 6 }).notNull().unique(),
  createdAt: date('created_at').defaultNow(),
  updatedAt: date('updated_at').defaultNow(),
});

export const moodMetrics = pgTable(
  'mood_metrics',
  {
    id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    averageMoodLevel: text('mood_level').notNull().default('neutral'),
    year: integer('year').notNull(),
    month: integer('month').notNull(),
    createdAt: date('created_at').defaultNow(),
    updatedAt: date('updated_at').defaultNow(),
  },
  (table) => ({
    userMonthYearUnique: unique().on(table.userId, table.year, table.month),
    userYearMonthIndex: index().on(table.userId, table.year, table.month),
  }),
);

export const taskTypes = pgTable('task_types', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  description: text('description').notNull(),
  actionType: varchar('action_type', { length: 255 }).notNull().default('none'),
  applicableRoles: jsonb('applicable_roles').notNull().default([]),
  tokenReward: integer('token_reward').notNull().default(1),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: date('created_at').defaultNow(),
  updatedAt: date('updated_at').defaultNow(),
});

export const dailyTasks = pgTable(
  'daily_tasks',
  {
    id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    taskTypeId: uuid('task_type_id')
      .notNull()
      .references(() => taskTypes.id, { onDelete: 'cascade' }),
    taskDate: date('task_date').notNull(),
    isCompleted: boolean('is_completed').notNull().default(false),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    tokenReward: integer('token_reward').notNull().default(1),
    createdAt: date('created_at').defaultNow(),
    updatedAt: date('updated_at').defaultNow(),
  },
  (table) => ({
    userDateIndex: index().on(table.userId, table.taskDate),
    userDateTaskTypeUnique: unique().on(
      table.userId,
      table.taskDate,
      table.taskTypeId,
    ),
  }),
);

export const taskCompletions = pgTable('task_completions', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  dailyTaskId: uuid('daily_task_id')
    .notNull()
    .references(() => dailyTasks.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  actionType: varchar('action_type', { length: 100 }).notNull(),
  relatedEntityId: uuid('related_entity_id'),
  relatedEntityType: varchar('related_entity_type', { length: 50 }),
  tokensAwarded: integer('tokens_awarded').notNull().default(1),
  completedAt: timestamp('completed_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: date('created_at').defaultNow(),
});
