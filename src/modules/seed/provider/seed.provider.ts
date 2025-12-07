import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { Inject, Injectable } from '@nestjs/common';
import * as schema from '@/schemas/schema';
import { Admins } from '@/modules/seed/data/admin';

@Injectable()
export class SeedProvider {
  private userIds: Set<string> | null = null;
  private smartWalletAddress: Set<string> | null = null;
  private healthId: Set<string> | null = null;
  private taskIds: Set<string> | null = null;

  constructor(@Inject(DRIZZLE_PROVIDER) private readonly db: Database) {}

  // private async getUserIds(): Promise<Set<string>> {
  //   if (this.userIds) {
  //     return this.userIds;
  //   }
  //   console.log('Fetching existing user IDs for validation...');
  //   const users = await this.db
  //     .select({ id: schema.user.id })
  //     .from(schema.user);
  //   this.userIds = new Set(users.map((u) => u.id));
  //   console.log(`Found ${this.userIds.size} existing users.`);
  //   return this.userIds;
  // }

  // private async getSmartWalletAddress() {
  //   if (this.smartWalletAddress) {
  //     return this.smartWalletAddress;
  //   }

  //   console.log('Fethcing existing smart wallet address');
  //   const account = await this.db
  //     .select({ walletAddress: schema.accounts.smartWalletAddress })
  //     .from(schema.accounts);

  //   this.smartWalletAddress = new Set(
  //     account.map((wallet) => wallet.walletAddress),
  //   );
  //   return this.smartWalletAddress;
  // }

  // private async getHealthInformation() {
  //   if (this.healthId) {
  //     return this.healthId;
  //   }

  //   console.log('Fetching existing health information');
  //   const healthInfo = await this.db
  //     .select({ healthId: schema.healthInformation.id })
  //     .from(schema.healthInformation);

  //   this.healthId = new Set(healthInfo.map((h) => h.healthId));
  //   return this.healthId;
  // }

  // private async getTaskIds(): Promise<Set<string>> {
  //   if (this.taskIds) {
  //     return this.taskIds;
  //   }
  //   console.log('Fetching existing task type IDs for validation...');
  //   const tasks = await this.db
  //     .select({ id: schema.taskTypes.id })
  //     .from(schema.taskTypes);
  //   this.taskIds = new Set(tasks.map((t) => t.id));
  //   console.log(`Found ${this.taskIds.size} existing task types.`);
  //   return this.taskIds;
  // }

  // async seedUsers() {
  //   try {
  //     console.log('Seeding users...');
  //     const transformedUsers = UsersData.map((user) => ({
  //       id: user.id,
  //       fullName: user.full_name,
  //       emailAddress: user.email_address,
  //       dateOfBirth: user.date_of_birth,
  //       gender: user.gender,
  //       phoneNumber: user.phone_number,
  //       profilePicture: user.profile_picture,
  //       password: user.password,
  //       role: user.role,
  //       status: user.status,
  //       authProvider: user.auth_provider,
  //       createdAt: user.created_at,
  //       updatedAt: new Date(user.updated_at),
  //       lastLogin: user.last_login ? new Date(user.last_login) : null,
  //       isFirstTime: user.is_first_time,
  //       lastActivity: user.last_activity ? new Date(user.last_activity) : null,
  //       isOtpVerified: user.is_otp_verified,
  //     }));

  //     await this.db
  //       .insert(schema.user)
  //       .values(transformedUsers)
  //       .onConflictDoNothing()
  //       .execute();

  //     console.log(`Seeded ${transformedUsers.length} users.`);
  //   } catch (e) {
  //     console.error('Error seeding users:', e);
  //     throw e;
  //   }
  // }

  async seedAdmins() {
    try {
      console.log('Seeding admins...');
      const transformedAdmins = Admins.map((admin) => ({
        id: admin.id,
        userName: admin.user_name,
        email: admin.email,
        password: admin.password,
        permissionLevel: admin.permission_level,
        createdAt: admin.created_at,
        updatedAt: new Date(admin.updated_at),
        profilePicture: admin.profile_picture,
      }));

      await this.db
        .insert(schema.admin)
        .values(transformedAdmins)
        .onConflictDoNothing()
        .execute();

      console.log(`Seeded ${transformedAdmins.length} admins.`);
    } catch (e) {
      console.error('Error seeding admins:', e);
      throw e;
    }
  }

  // async seedAccounts() {
  //   try {
  //     const existingUserIds = await this.getUserIds();
  //     const validData = Accounts.filter((d) => existingUserIds.has(d.user_id));
  //     const skippedCount = Accounts.length - validData.length;
  //     if (skippedCount > 0) {
  //       console.log(`Skipping ${skippedCount} accounts with invalid user IDs.`);
  //     }

  //     if (validData.length === 0) {
  //       console.log('No valid accounts to seed.');
  //       return;
  //     }

  //     console.log('Seeding accounts...');
  //     const transformedAccounts = validData.map((account) => ({
  //       id: account.id,
  //       userId: account.user_id,
  //       externalAddress: account.external_address,
  //       smartWalletAddress: account.smart_wallet_address,
  //       privateKey: account.private_key,
  //       createdAt: account.created_at,
  //       updatedAt: new Date(account.updated_at),
  //     }));

  //     await this.db
  //       .insert(schema.accounts)
  //       .values(transformedAccounts)
  //       .onConflictDoNothing()
  //       .execute();

  //     console.log(`Seeded ${transformedAccounts.length} accounts.`);
  //   } catch (e) {
  //     console.error('Error seeding accounts:', e);
  //     throw e;
  //   }
  // }

  // async seedApprovals() {
  //   try {
  //     const existingWalletAddress = await this.getSmartWalletAddress();
  //     const existingUserIds = await this.getUserIds();
  //     const existingHealthId = await this.getHealthInformation();
  //     const validData = Approvals.filter(
  //       (d) =>
  //         existingUserIds.has(d.user_id) &&
  //         existingWalletAddress.has(d.practitioner_address) &&
  //         existingHealthId.has(d.user_health_info_id as string),
  //     );
  //     const skippedCount = Approvals.length - validData.length;
  //     if (skippedCount > 0) {
  //       console.log(
  //         `Skipping ${skippedCount} approvals with invalid user IDs.`,
  //       );
  //     }

  //     if (validData.length === 0) {
  //       console.log('No valid approvals to seed.');
  //       return;
  //     }

  //     console.log('Seeding approvals...');
  //     const transformedApprovals = validData.map((approval) => ({
  //       id: approval.id,
  //       userId: approval.user_id,
  //       practitionerAddress: approval.practitioner_address,
  //       userHealthInfoId: approval.user_health_info_id,
  //       recordId: approval.recordId,
  //       duration: approval.duration,
  //       createdAt: approval.created_at,
  //       updatedAt: new Date(approval.updated_at),
  //       accessLevel: approval.access_level,
  //       isRequestAccepted: approval.isRequestAccepted,
  //       status: approval.status,
  //     }));

  //     await this.db
  //       .insert(schema.approvals)
  //       .values(transformedApprovals)
  //       .onConflictDoNothing()
  //       .execute();

  //     console.log(`Seeded ${transformedApprovals.length} approvals.`);
  //   } catch (e) {
  //     console.error('Error seeding approvals:', e);
  //     throw e;
  //   }
  // }

  // async seedIdentities() {
  //   try {
  //     const existingUserIds = await this.getUserIds();
  //     const validData = Identities.filter((d) =>
  //       existingUserIds.has(d.user_id),
  //     );
  //     const skippedCount = Identities.length - validData.length;
  //     if (skippedCount > 0) {
  //       console.log(
  //         `Skipping ${skippedCount} identities with invalid user IDs.`,
  //       );
  //     }

  //     if (validData.length === 0) {
  //       console.log('No valid identities to seed.');
  //       return;
  //     }

  //     console.log('Seeding identities...');
  //     const transformedIdentities = validData.map((identity) => ({
  //       id: identity.id,
  //       userId: identity.user_id,
  //       role: identity.role,
  //       governmentFileId: identity.government_file_id,
  //       governmentId: identity.government_id,
  //       scannedLicenseFileId: identity.scanned_license_file_id,
  //       scannedLicense: identity.scanned_license,
  //       createdAt: identity.created_at,
  //       updatedAt: new Date(identity.updated_at),
  //     }));

  //     await this.db
  //       .insert(schema.identity)
  //       .values(transformedIdentities)
  //       .onConflictDoNothing()
  //       .execute();

  //     console.log(`Seeded ${transformedIdentities.length} identities.`);
  //   } catch (e) {
  //     console.error('Error seeding identities:', e);
  //     throw e;
  //   }
  // }

  // async seedDoctors() {
  //   try {
  //     const existingUserIds = await this.getUserIds();
  //     const validData = Doctors.filter((d) => existingUserIds.has(d.user_id));
  //     const skippedCount = Doctors.length - validData.length;
  //     if (skippedCount > 0) {
  //       console.log(`Skipping ${skippedCount} doctors with invalid user IDs.`);
  //     }

  //     if (validData.length === 0) {
  //       console.log('No valid doctors to seed.');
  //       return;
  //     }

  //     console.log('Seeding doctors...');
  //     const transformedDoctors = validData.map((doctor) => ({
  //       id: doctor.id,
  //       userId: doctor.user_id,
  //       specialization: doctor.specialization,
  //       bio: doctor.bio,
  //       recordsReviewed: doctor.records_reviewed,
  //       medicalLicenseNumber: doctor.license_number,
  //       licenseExpirationDate: doctor.license_expiration_date,
  //       certifications: doctor.certifications,
  //       servicesOffered: doctor.services_offered,
  //       hospitalAssociation: doctor.hospital_association,
  //       locationOfHospital: doctor.location_of_hospital,
  //       yearsOfExperience: doctor.years_of_experience,
  //       languagesSpoken: doctor.languages_spoken,
  //       availability: doctor.availability,
  //       lastLogin: doctor.last_login ? new Date(doctor.last_login) : null,
  //       createdAt: doctor.created_at,
  //       updatedAt: new Date(doctor.updated_at),
  //       isFirstTime: doctor.is_first_time,
  //       lastActivity: doctor.last_activity
  //         ? new Date(doctor.last_activity)
  //         : null,
  //       isVerified: doctor.is_verified,
  //     }));

  //     await this.db
  //       .insert(schema.doctors)
  //       .values(transformedDoctors)
  //       .onConflictDoNothing()
  //       .execute();

  //     console.log(`Seeded ${transformedDoctors.length} doctors.`);
  //   } catch (e) {
  //     console.error('Error seeding doctors:', e);
  //     throw e;
  //   }
  // }

  // async seedOtps() {
  //   try {
  //     console.log('Seeding OTPs...');
  //     const transformedOtps = Otps.map((otp) => ({
  //       id: otp.id,
  //       emailAddress: otp.email_address,
  //       otpCode: otp.otp_code,
  //       createdAt: otp.created_at,
  //       updatedAt: new Date(otp.updated_at),
  //     }));

  //     await this.db
  //       .insert(schema.otp)
  //       .values(transformedOtps)
  //       .onConflictDoNothing()
  //       .execute();

  //     console.log(`Seeded ${transformedOtps.length} OTPs.`);
  //   } catch (e) {
  //     console.error('Error seeding OTPs:', e);
  //     throw e;
  //   }
  // }

  // async seedDailyTasks() {
  //   try {
  //     const existingUserIds = await this.getUserIds();
  //     const existingTaskIds = await this.getTaskIds();
  //     const validData = DailyTasks.filter(
  //       (d) =>
  //         existingUserIds.has(d.user_id) && existingTaskIds.has(d.task_type_id),
  //     );
  //     const skippedCount = DailyTasks.length - validData.length;
  //     if (skippedCount > 0) {
  //       console.log(
  //         `Skipping ${skippedCount} daily tasks with invalid user IDs or task type IDs.`,
  //       );
  //     }

  //     if (validData.length === 0) {
  //       console.log('No valid daily tasks to seed.');
  //       return;
  //     }

  //     console.log('Seeding daily tasks...');
  //     const transformedDailyTasks = validData.map((dailyTask) => ({
  //       id: dailyTask.id,
  //       userId: dailyTask.user_id,
  //       taskTypeId: dailyTask.task_type_id,
  //       taskDate: dailyTask.task_date,
  //       isCompleted: dailyTask.is_completed,
  //       completedAt: dailyTask.completed_at
  //         ? new Date(dailyTask.completed_at)
  //         : null,
  //       tokenReward: dailyTask.token_reward,
  //       createdAt: dailyTask.created_at,
  //       updatedAt: new Date(dailyTask.updated_at),
  //     }));

  //     await this.db
  //       .insert(schema.dailyTasks)
  //       .values(transformedDailyTasks)
  //       .onConflictDoNothing()
  //       .execute();

  //     console.log(`Seeded ${transformedDailyTasks.length} daily tasks.`);
  //   } catch (e) {
  //     console.error('Error seeding daily tasks:', e);
  //     throw e;
  //   }
  // }

  // async seedRecords() {
  //   try {
  //     const existingUserIds = await this.getUserIds();
  //     const validData = Records.filter((d) => existingUserIds.has(d.user_id));
  //     const skippedCount = Records.length - validData.length;

  //     if (skippedCount > 0) {
  //       console.log(`Skipping ${skippedCount} records with invalid user Ids`);
  //     }

  //     if (validData.length === 0) {
  //       console.log('No valid record to seed.');
  //       return;
  //     }

  //     console.log('Seeding record data');

  //     const transformedRecordData = validData.map((data) => ({
  //       id: data.id,
  //       userId: data.user_id,
  //       recordChainId: data.record_chain_id,
  //       title: data.title,
  //       recordType: data.record_type,
  //       practitionerName: data.practitioner_name,
  //       status: data.status,
  //       createdAt: data.created_at,
  //       updatedAt: new Date(data.updated_at),
  //     }));

  //     await this.db
  //       .insert(schema.records)
  //       .values(transformedRecordData)
  //       .onConflictDoNothing()
  //       .execute();

  //     console.log(`Seeded ${transformedRecordData.length}  records.`);
  //   } catch (e) {
  //     console.error('Error seeding records');
  //     throw e;
  //   }
  // }

  // async seedHealthInformation() {
  //   try {
  //     const existingUserIds = await this.getUserIds();
  //     const validData = HealthInformation.filter((d) =>
  //       existingUserIds.has(d.user_id),
  //     );
  //     const skippedCount = HealthInformation.length - validData.length;
  //     if (skippedCount > 0) {
  //       console.log(
  //         `Skipping ${skippedCount} health information records with invalid user IDs.`,
  //       );
  //     }

  //     if (validData.length === 0) {
  //       console.log('No valid health information to seed.');
  //       return;
  //     }

  //     console.log('Seeding health information...');
  //     const transformedHealthInformation = validData.map((info) => ({
  //       id: info.id,
  //       userId: info.user_id,
  //       howAreYouFeeling: info.how_are_you_feeling,
  //       whenDidItStart: info.when_did_it_start,
  //       painLevel: info.pain_level,
  //       knownConditions: info.known_conditions,
  //       medicationsTaken: info.medications_taken,
  //       attachment: info.attachment,
  //       attachmentFileId: info.attachment_file_id,
  //       createdAt: info.created_at,
  //       updatedAt: new Date(info.updated_at),
  //     }));

  //     await this.db
  //       .insert(schema.healthInformation)
  //       .values(transformedHealthInformation)
  //       .onConflictDoNothing()
  //       .execute();

  //     console.log(
  //       `Seeded ${transformedHealthInformation.length} health information records.`,
  //     );
  //   } catch (e) {
  //     console.error('Error seeding health information:', e);
  //     throw e;
  //   }
  // }
  // async seedTaskTypes() {
  //   try {
  //     console.log('Seeding task types...');
  //     const transformedTaskTypes = TaskTypes.map((task) => ({
  //       id: task.id,
  //       name: task.name,
  //       description: task.description,
  //       actionType: task.action_type,
  //       applicableRoles: task.applicable_roles,
  //       tokenReward: task.token_reward,
  //       isActive: task.is_active,
  //       createdAt: new Date(task.created_at).toISOString(),
  //       updatedAt: new Date(task.updated_at),
  //     }));

  //     await this.db
  //       .insert(schema.taskTypes)
  //       .values(transformedTaskTypes)
  //       .onConflictDoNothing()
  //       .execute();

  //     console.log(`Seeded ${transformedTaskTypes.length} task types.`);
  //   } catch (e) {
  //     console.error('Error seeding task types:', e);
  //     throw e;
  //   }
  // }

  // async seedHealthJournal() {
  //   try {
  //     const existingUserIds = await this.getUserIds();
  //     const validData = HealthJournalData.filter((d) =>
  //       existingUserIds.has(d.user_id),
  //     );
  //     const skippedCount = HealthJournalData.length - validData.length;
  //     if (skippedCount > 0) {
  //       console.log(
  //         `Skipping ${skippedCount} health journal entries with invalid user IDs.`,
  //       );
  //     }

  //     if (validData.length === 0) {
  //       console.log('No valid health journal entries to seed.');
  //       return;
  //     }

  //     console.log('Seeding health journal entries...');
  //     const transformedData = validData.map((entry) => ({
  //       id: entry.id,
  //       userId: entry.user_id,
  //       mood: entry.mood,
  //       symptoms: entry.symptoms,
  //       activities: entry.activities,
  //       tags: entry.tags,
  //       createdAt: new Date(entry.created_at).toISOString(),
  //       updatedAt: new Date(entry.updated_at),
  //     }));

  //     await this.db
  //       .insert(schema.health_journal)
  //       .values(transformedData)
  //       .onConflictDoNothing()
  //       .execute();

  //     console.log(`Seeded ${transformedData.length} health journal entries.`);
  //   } catch (e) {
  //     console.error('Error seeding health journal:', e);
  //     throw e;
  //   }
  // }

  // async seedUserRecordCounters() {
  //   try {
  //     const existingUserIds = await this.getUserIds();
  //     const validData = UserRecordCounters.filter((d) =>
  //       existingUserIds.has(d.user_id),
  //     );
  //     const skippedCount = UserRecordCounters.length - validData.length;
  //     if (skippedCount > 0) {
  //       console.log(
  //         `Skipping ${skippedCount} user record counters with invalid user IDs.`,
  //       );
  //     }

  //     if (validData.length === 0) {
  //       console.log('No valid user record counters to seed.');
  //       return;
  //     }

  //     console.log('Seeding user record counters...');
  //     const transformedData = validData.map((counter) => ({
  //       id: counter.id,
  //       userId: counter.user_id,
  //       lastRecordChainId: counter.last_record_chain_id,
  //       createdAt: new Date(counter.created_at).toISOString(),
  //       updatedAt: new Date(counter.updated_at),
  //     }));

  //     await this.db
  //       .insert(schema.userRecordCounters)
  //       .values(transformedData)
  //       .onConflictDoNothing()
  //       .execute();

  //     console.log(`Seeded ${transformedData.length} user record counters.`);
  //   } catch (e) {
  //     console.error('Error seeding user record counters:', e);
  //     throw e;
  //   }
  // }

  // async seedDailyRewards() {
  //   try {
  //     const existingUserIds = await this.getUserIds();
  //     const validData = DailyRewards.filter((d) =>
  //       existingUserIds.has(d.user_id),
  //     );
  //     const skippedCount = DailyRewards.length - validData.length;
  //     if (skippedCount > 0) {
  //       console.log(
  //         `Skipping ${skippedCount} daily rewards with invalid user IDs.`,
  //       );
  //     }

  //     if (validData.length === 0) {
  //       console.log('No valid daily rewards to seed.');
  //       return;
  //     }

  //     console.log('Seeding daily rewards...');
  //     const transformedData = validData.map((reward) => ({
  //       id: reward.id,
  //       userId: reward.user_id,
  //       dailyTaskCount: reward.daily_task_count,
  //       isTokenMinted: reward.is_token_minted,
  //       createdAt: new Date(reward.created_at).toISOString(),
  //       updatedAt: new Date(reward.updated_at),
  //     }));

  //     await this.db
  //       .insert(schema.dailyReward)
  //       .values(transformedData)
  //       .onConflictDoNothing()
  //       .execute();

  //     console.log(`Seeded ${transformedData.length} daily rewards.`);
  //   } catch (e) {
  //     console.error('Error seeding daily rewards:', e);
  //     throw e;
  //   }
  // }

  // async seedMoodMetrics() {
  //   try {
  //     const existingUserIds = await this.getUserIds();
  //     const validData = MoodMetrics.filter((d) =>
  //       existingUserIds.has(d.user_id),
  //     );

  //     const skippedCount = MoodMetrics.length - validData.length;
  //     if (skippedCount > 0) {
  //       console.log(
  //         `Skipping ${skippedCount} mood metrivs with invalid user IDs.`,
  //       );
  //     }

  //     if (validData.length === 0) {
  //       console.log('No valid mood metrics to seed.');
  //       return;
  //     }

  //     const transformedData = MoodMetrics.map((data) => ({
  //       id: data.id,
  //       userId: data.user_id,
  //       month: data.month,
  //       year: data.year,
  //       moodLevel: data.mood_level,
  //       createdAt: new Date(data.created_at).toISOString(),
  //       updatedAt: new Date(data.updated_at),
  //     }));
  //     await this.db
  //       .insert(schema.moodMetrics)
  //       .values(transformedData)
  //       .onConflictDoNothing()
  //       .execute();

  //     console.log(`Seeded ${transformedData.length} daily rewards.`);
  //   } catch (e) {
  //     console.error('An error occurred when seeding mood metrics', e);
  //     throw e;
  //   }
  // }

  // async seedConsultationTypes() {
  //   try {
  //     await this.db
  //       .insert(schema.consultationTypes)
  //       .values(CONSULTATION_TYPES_SEED_DATA)
  //       .onConflictDoNothing()
  //       .execute();

  //     console.log(
  //       `Seeded ${CONSULTATION_TYPES_SEED_DATA.length} consultations`,
  //     );
  //   } catch (e) {
  //     console.error('An error occurred when seeding consulation types', e);
  //     throw e;
  //   }
  // }

  // async seedDailyTaskTypes() {
  //   try {
  //     await this.db
  //       .insert(schema.taskTypes)
  //       .values(DEFAULT_TASK_TYPES)
  //       .onConflictDoNothing()
  //       .execute();
  //     console.log(`Seed ${DEFAULT_TASK_TYPES.length} tasks`);
  //   } catch (e) {
  //     console.error(`error seeding daily task types`);
  //     throw e;
  //   }
  // }
}
