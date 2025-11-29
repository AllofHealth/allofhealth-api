import {
  boolean,
  date,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  time,
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
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
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
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
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
  recordsReviewed: integer('records_reviewed').default(0),
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
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
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
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
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
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
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
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
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
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  accessLevel: text('access_level').notNull().default('read'),
  isRequestAccepted: boolean().notNull().default(false),
  status: text('status').notNull().default('CREATED'),
});

export const admin = pgTable('admin', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  userName: varchar('user_name', { length: 255 }).notNull().unique(),
  profilePicture: text('profile_picture').default(PLACEHOLDER),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  permissionLevel: text('permission_level').notNull().default('system'),
  createdAt: date('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
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
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const userRecordCounters = pgTable('user_record_counters', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  lastRecordChainId: integer('last_record_chain_id').notNull().default(0),
  createdAt: date('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
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
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const dailyReward = pgTable('daily_reward', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  dailyTaskCount: integer('daily_task_count').notNull().default(1),
  isTokenMinted: boolean('is_token_minted').notNull().default(false),
  createdAt: date('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const otp = pgTable('otp', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  emailAddress: varchar('email_address', { length: 255 }).notNull().unique(),
  otpCode: varchar('otp_code', { length: 6 }).notNull().unique(),
  createdAt: date('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
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
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
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
  tokenReward: decimal('token_reward', { precision: 10, scale: 4 })
    .notNull()
    .default('0.01'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: date('created_at').defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
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
    tokenReward: decimal('token_reward', { precision: 10, scale: 4 })
      .notNull()
      .default('0.01'),
    createdAt: date('created_at').defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
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
  tokensAwarded: decimal('tokens_awarded', { precision: 10, scale: 4 })
    .notNull()
    .default('0.01'),
  completedAt: timestamp('completed_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: date('created_at').defaultNow(),
});

export const suspensionLogs = pgTable('suspension_logs', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  reason: varchar('reason', { length: 255 }).notNull(),
  startDate: date('start_date').defaultNow(),
  endDate: date('end_date'),
  createdAt: date('created_at').defaultNow(),
});

export const rejectionLogs = pgTable('rejection_logs', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  email: varchar('email', { length: 255 }).notNull(),
  reason: varchar('reason', { length: 255 }).notNull(),
  createdAt: date('created_at').defaultNow(),
});

export const contractRegistrationFailures = pgTable(
  'contract_registration_failures',
  {
    id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    reason: varchar('reason', { length: 255 }).notNull(),
    createdAt: date('created_at').defaultNow(),
  },
);

export const doctorCalendarIntegrations = pgTable(
  'doctor_calendar_integrations',
  {
    id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
    doctorId: uuid('doctor_id')
      .notNull()
      .references(() => doctors.id, { onDelete: 'cascade' }),
    provider: varchar('provider', { length: 50 }).notNull().default('calcom'),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    providerUserId: varchar('provider_user_id', { length: 255 }),
    providerEmail: varchar('provider_email', { length: 255 }),
    isActive: boolean('is_active').notNull().default(true),
    lastSyncAt: timestamp('last_sync_at', { withTimezone: true }),
    createdAt: date('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);

export const consultationTypes = pgTable('consultation_type', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: date('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const doctorConsultationTypes = pgTable('doctor_consultation_types', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  doctorId: uuid('doctor_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  consultationType: uuid('consultation_type')
    .notNull()
    .references(() => consultationTypes.id, { onDelete: 'cascade' }),

  description: text('description'),
  durationMinutes: integer('duration_minutes').notNull().default(30),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('NGN'),
  calcomEventTypeId: integer('calcom_event_type_id'), // Cal.com event type ID
  isActive: boolean('is_active').notNull().default(true),
  createdAt: date('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const consultationBookings = pgTable(
  'consultation_bookings',
  {
    id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
    bookingReference: varchar('booking_reference', { length: 50 })
      .notNull()
      .unique(),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    doctorId: uuid('doctor_id')
      .notNull()
      .references(() => doctors.id, { onDelete: 'cascade' }),
    consultationId: uuid('consultation_type_id')
      .notNull()
      .references(() => doctorConsultationTypes.id, { onDelete: 'restrict' }),

    consultationDate: date('consultation_date').notNull(),
    startTime: timestamp('start_time', { withTimezone: true }).notNull(),
    endTime: timestamp('end_time', { withTimezone: true }).notNull(),
    timezone: varchar('timezone', { length: 50 }).notNull().default('UTC'),

    status: varchar('status', { length: 50 })
      .notNull()
      .default('pending_payment'), // pending_payment, processing_payment, confirmed, completed, cancelled, no_show
    paymentStatus: varchar('payment_status', { length: 50 })
      .notNull()
      .default('pending'),

    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('NGN'),
    paymentIntentId: varchar('payment_intent_id', { length: 255 }),
    paidAt: timestamp('paid_at', { withTimezone: true }),

    externalProvider: varchar('external_provider', { length: 50 }).default(
      'calcom',
    ),
    externalBookingId: varchar('external_booking_id', { length: 255 }).unique(),
    externalBookingUrl: text('external_booking_url'),

    videoRoomId: varchar('video_room_id', { length: 255 }),
    videoRoomUrl: text('video_room_url'),
    videoPlatform: varchar('video_platform', { length: 50 }).default('doxy'),

    patientNotes: text('patient_notes'),
    doctorNotes: text('doctor_notes'),

    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    cancellationReason: text('cancellation_reason'),
    cancelledBy: uuid('cancelled_by').references(() => user.id),

    metadata: jsonb('metadata').default('{}'),
    reminderRetryCount: integer('retry_count').default(0),

    createdAt: date('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    patientIdIndex: index().on(table.patientId),
    doctorIdIndex: index().on(table.doctorId),
    statusIndex: index().on(table.status),
    consultationDateIndex: index().on(table.consultationDate),
  }),
);

export const bookingAuditLogs = pgTable(
  'booking_audit_logs',
  {
    id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
    bookingId: uuid('booking_id')
      .notNull()
      .references(() => consultationBookings.id, { onDelete: 'cascade' }),
    action: varchar('action', { length: 100 }).notNull(),
    actorId: uuid('actor_id')
      .notNull()
      .references(() => user.id), // Who performed the action
    actorType: varchar('actor_type', { length: 50 }).notNull(),
    previousStatus: varchar('previous_status', { length: 50 }),
    newStatus: varchar('new_status', { length: 50 }),
    changes: jsonb('changes').default('{}'),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    bookingIdIndex: index().on(table.bookingId),
    createdAtIndex: index().on(table.createdAt),
  }),
);

export const doctorAvailabilitySlots = pgTable(
  'doctor_availability_slots',
  {
    id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
    doctorId: uuid('doctor_id')
      .notNull()
      .references(() => doctors.id, { onDelete: 'cascade' }),
    dayOfWeek: integer('day_of_week').notNull(), // 0=Sunday, 1=Monday, etc.
    startTime: varchar('start_time', { length: 5 }).notNull(), // HH:MM format (e.g., "09:00")
    endTime: varchar('end_time', { length: 5 }).notNull(), // HH:MM format (e.g., "17:00")
    isActive: boolean('is_active').notNull().default(true),
    createdAt: date('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    doctorDayIndex: index().on(table.doctorId, table.dayOfWeek),
  }),
);

export const paymentTransactions = pgTable(
  'payment_transactions',
  {
    id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
    bookingId: uuid('booking_id')
      .notNull()
      .references(() => consultationBookings.id, { onDelete: 'cascade' }),
    transactionReference: varchar('transaction_reference', { length: 100 })
      .notNull()
      .unique(),
    paymentGateway: varchar('payment_gateway', { length: 50 })
      .notNull()
      .default('flutterwave'), // or stripe : yet to decide.
    paymentIntentId: varchar('payment_intent_id', { length: 255 }),
    chargeId: varchar('charge_id', { length: 255 }),

    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('NGN'),
    platformFee: decimal('platform_fee', { precision: 10, scale: 2 }).default(
      '0',
    ),
    doctorPayout: decimal('doctor_payout', {
      precision: 10,
      scale: 2,
    }).notNull(),

    status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, processing, paid, failed, refunded

    refundId: varchar('refund_id', { length: 255 }),
    refundedAmount: decimal('refunded_amount', { precision: 10, scale: 2 }),
    refundedAt: timestamp('refunded_at', { withTimezone: true }),

    gatewayResponse: jsonb('gateway_response').default('{}'),

    createdAt: date('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    bookingIdIndex: index().on(table.bookingId),
    statusIndex: index().on(table.status),
  }),
);

export const availability = pgTable('availability', {
  id: uuid('id').notNull().primaryKey().defaultRandom().unique(),
  doctorId: uuid('doctor_id')
    .notNull()
    .references(() => user.id),
  weekDay: varchar('week_day', { length: 10 }).notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  createdAt: date('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
