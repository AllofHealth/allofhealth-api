import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  IAdminLogin,
  IApprovalDashboardResponse,
  ICreateAdmin,
  ICreateSystemAdmin,
  IDeleteAdmin,
  IDetermineActivityStatus,
  IFetchApprovalManagementData,
  IHandleIsUserRejected,
  IInspectDoctorResponse,
  IInspectPatientResponse,
  IManagePermissions,
  IRejectUser,
  ISuspendUser,
  IVerifyPractitioner,
} from '../interface/admin.interface';
import {
  ACTIVITY_THRESHOLD,
  ADMIN_ERROR_MESSAGES as AEM,
  ADMIN_SUCCESS_MESSAGES as ASM,
  REJECTION_REASON,
  SUSPENSION_REASON,
} from '../data/admin.data';
import { AuthUtils } from '@/shared/utils/auth.utils';
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import * as schema from '@/schemas/schema';
import { AuthService } from '@/modules/auth/service/auth.service';
import { DoctorService } from '@/modules/doctor/service/doctor.service';
import { DOCTOR_ERROR_MESSGAES } from '@/modules/doctor/data/doctor.data';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { AdminError } from '../error/admin.error';
import {
  USER_ERROR_MESSAGES,
  USER_ROLE,
  USER_STATUS,
} from '@/modules/user/data/user.data';
import { UserService } from '@/modules/user/service/user.service';
import { IFetchDoctors } from '@/modules/doctor/interface/doctor.interface';
import {
  IFetchPatients,
  IFetchUsers,
  IUserSnippet,
} from '@/modules/user/interface/user.interface';
import {
  formatDateToReadable,
  formatDateToStandard,
} from '@/shared/utils/date.utils';
import { AssetService } from '@/modules/asset/service/asset.service';
import { ApprovalService } from '@/modules/approval/service/approval.service';
import { ILoginResponse } from '@/modules/auth/interface/auth.interface';
import { NewsletterService } from '@/modules/newsletter/service/newsletter.service';
import { IFetchAllContacts } from '@/shared/modules/brevo/interface/brevo.interface';

@Injectable()
export class AdminProvider {
  private readonly logger = new MyLoggerService(AdminProvider.name);
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
    private readonly handler: ErrorHandler,
    private readonly authUtils: AuthUtils,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly doctorService: DoctorService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly assetService: AssetService,
    private readonly approvalService: ApprovalService,
    private readonly newsletterService: NewsletterService,
  ) {}

  private async validateIsSuperAdmin(adminId: string) {
    let isValidated: boolean = false;
    try {
      const superAdminResult = await this.db.query.admin.findFirst({
        where: eq(schema.admin.id, adminId),
      });

      if (superAdminResult && superAdminResult.permissionLevel === 'super') {
        isValidated = true;
      }

      return isValidated;
    } catch (e) {
      throw new HttpException(
        AEM.ERROR_VALIDATING_SUPER_ADMIN,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async validateIsAdmin(adminId: string) {
    let isValidated: boolean = false;
    try {
      const adminResult = await this.db.query.admin.findFirst({
        where: eq(schema.admin.id, adminId),
      });

      if (adminResult && adminResult.permissionLevel === 'system') {
        isValidated = true;
      }

      return isValidated;
    } catch (e) {
      throw new HttpException(
        AEM.ERROR_VALIDATING_SUPER_ADMIN,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async isUserSuspended(userId: string) {
    let isSuspended: boolean = false;
    try {
      const user = await this.db
        .select({ status: schema.user.status })
        .from(schema.user)
        .where(eq(schema.user.id, userId));

      if (!user || user.length === 0) {
        throw new AdminError(
          USER_ERROR_MESSAGES.USER_NOT_FOUND,
          { cause: 'User not found' },
          HttpStatus.NOT_FOUND,
        );
      }

      isSuspended = user[0].status === USER_STATUS.SUSPENDED;
      return isSuspended;
    } catch (e) {
      this.logger.error(e);
      throw new AdminError(
        AEM.ERROR_VALIDATING_SUSPENSION_STATUS,
        { cause: e },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async verifyDoctor(doctorId: string) {
    try {
      const doctor = await this.doctorService.fetchDoctor(doctorId);

      if (!doctor?.data) {
        throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
      }

      const isVerified = doctor.data.isVerified;
      if (isVerified) {
        return this.handler.handleReturn({
          status: HttpStatus.OK,
          message: ASM.PRACTITIONER_VERIFIED,
        });
      }

      await this.db
        .update(schema.doctors)
        .set({
          isVerified: true,
        })
        .where(eq(schema.doctors.userId, doctorId));

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.PRACTITIONER_VERIFIED,
      });
    } catch (e) {
      this.handler.handleError(e, AEM.ERROR_VERIFYING_PRACTITIONER);
    }
  }

  private determineActivityStatus(ctx: IDetermineActivityStatus) {
    const { lastActive, timestamp = new Date() } = ctx;
    let isActive: boolean = false;

    if (!lastActive) {
      isActive = false;
    } else {
      const timeSinceLastActive = timestamp.getTime() - lastActive.getTime();
      isActive = timeSinceLastActive < ACTIVITY_THRESHOLD.ACTIVE;
    }

    return isActive;
  }

  async determineIsAdmin(emailAddress: string) {
    let isAdmin: boolean = false;
    try {
      const admin = await this.db
        .select()
        .from(schema.admin)
        .where(eq(schema.admin.email, emailAddress));

      if (admin && admin.length > 0) {
        isAdmin = true;
      }

      return isAdmin;
    } catch (e) {
      this.logger.error(`${AEM.ERROR_VERIFYING_ADMIN_STATUS} : ${e}`);
      throw new HttpException(
        `${AEM.ERROR_VERIFYING_ADMIN_STATUS} : ${e}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async fetchActiveUsers() {
    let activeUsers: any[] = [];
    try {
      const users = await this.db
        .select()
        .from(schema.user)
        .where(eq(schema.user.status, USER_STATUS.ACTIVE));

      if (!users || users.length === 0) {
        return [];
      }

      users.map((user) => {
        const isActive = this.determineActivityStatus({
          lastActive: user.lastActivity!,
        });

        if (isActive) {
          activeUsers.push(user);
        }
      });

      return activeUsers;
    } catch (e) {
      this.logger.error(`${AEM.ERROR_FETCHING_ACTIVE_USERS}: ${e}`);
      throw new AdminError(
        AEM.ERROR_FETCHING_ACTIVE_USERS,
        { cause: e },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async fetchSuspendedUsersCount() {
    try {
      const suspendedUsers = await this.db
        .select({
          count: sql`count(*)`.as('count'),
        })
        .from(schema.user)
        .where(eq(schema.user.status, USER_STATUS.SUSPENDED));

      return Number(suspendedUsers[0]?.count || 0);
    } catch (e) {
      this.logger.error(e);
      throw new AdminError(
        AEM.ERROR_FETCHING_SUSPENDED_USERS,
        { cause: e },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async inspectPatientData(userId: string) {
    try {
      const patient = await this.db
        .select({
          userId: schema.user.id,
          fullName: schema.user.fullName,
          profilePicture: schema.user.profilePicture,
          emailAddress: schema.user.emailAddress,
          phoneNumber: schema.user.phoneNumber,
          gender: schema.user.gender,
          status: schema.user.status,
          lastActive: schema.user.lastActivity,
          dateJoined: schema.user.createdAt,
          dob: schema.user.dateOfBirth,
          role: schema.user.role,
          governmentIdUrl: schema.identity.governmentId,
          medicalRecordsCreated: schema.userRecordCounters.lastRecordChainId,
        })
        .from(schema.user)
        .leftJoin(schema.identity, eq(schema.identity.userId, userId))
        .leftJoin(
          schema.userRecordCounters,
          eq(schema.userRecordCounters.userId, userId),
        )
        .where(eq(schema.user.id, userId))
        .limit(1);

      if (!patient || patient.length === 0) {
        return this.handler.handleReturn({
          status: HttpStatus.NOT_FOUND,
          message: AEM.PATIENT_NOT_FOUND,
          data: null,
        });
      }

      this.logger.debug(`Patient fetched ${JSON.stringify(patient)}`);

      const parsedPatient = patient.map((p) => {
        return {
          ...p,
          dateJoined: formatDateToReadable(p.dateJoined),
          dob: formatDateToReadable(p.dob),
          identityAssets: {
            governmentIdUrl: this.assetService.generateUrl(
              p.governmentIdUrl as string,
            ),
          },
          patientActivity: {
            appointmentsBooked: 0,
            medicalRecordsCreated: p.medicalRecordsCreated
              ? p.medicalRecordsCreated
              : 0,
          },
          lastActive: p.lastActive
            ? formatDateToReadable(p.lastActive)
            : 'never',
        } as IInspectPatientResponse;
      });

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.PATIENT_DATA_FETCHED,
        data: parsedPatient[0],
      });
    } catch (e) {
      throw new HttpException(
        new AdminError(
          AEM.ERROR_FETCHING_PATIENT_DATA,
          { cause: e },
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async inspectDoctorData(userId: string) {
    try {
      const doctor = await this.db
        .select({
          userId: schema.user.id,
          fullName: schema.user.fullName,
          profilePicture: schema.user.profilePicture,
          emailAddress: schema.user.emailAddress,
          phoneNumber: schema.user.phoneNumber,
          gender: schema.user.gender,
          status: schema.user.status,
          lastActive: schema.user.lastActivity,
          dateJoined: schema.user.createdAt,
          dob: schema.user.dateOfBirth,
          role: schema.user.role,
          governmentIdUrl: schema.identity.governmentFileId,
          medicalLicenseUrl: schema.identity.scannedLicenseFileId,
          yearsOfExperience: schema.doctors.yearsOfExperience,
          hospitalAffiliation: schema.doctors.hospitalAssociation,
          bio: schema.doctors.bio,
          languagesSpoken: schema.doctors.languagesSpoken,
          certifications: schema.doctors.certifications,
          servicesOffered: schema.doctors.servicesOffered,
          recordsReviewed: schema.doctors.recordsReviewed,
          medicalLicenseNumber: schema.doctors.medicalLicenseNumber,
        })
        .from(schema.user)
        .leftJoin(schema.doctors, eq(schema.doctors.userId, schema.user.id))
        .leftJoin(schema.identity, eq(schema.identity.userId, schema.user.id))
        .where(eq(schema.user.id, userId))
        .limit(1);

      if (!doctor || doctor.length === 0) {
        return this.handler.handleReturn({
          status: HttpStatus.NOT_FOUND,
          message: DOCTOR_ERROR_MESSGAES.DOCTOR_NOT_FOUND,
          data: null,
        });
      }

      const pendingApprovals =
        (await this.approvalService.fetchPendingApprovalCount(userId)) || 0;

      const parsedDoctor = await Promise.all(
        doctor.map(async (d) => {
          let servicesOffered: string[] = [];
          if (!Array.isArray(d.servicesOffered)) {
            servicesOffered = [d.servicesOffered as string];
          } else {
            servicesOffered = d.servicesOffered as string[];
          }

          const [governmentIdUrl, medicalLicenseUrl] = await Promise.all([
            this.assetService.generateUrlFromFileId(
              d.governmentIdUrl as string,
            ),
            this.assetService.generateUrlFromFileId(
              d.medicalLicenseUrl as string,
            ),
          ]);

          return {
            ...d,
            dateJoined: formatDateToReadable(d.dateJoined),
            lastActive: d.lastActive
              ? formatDateToReadable(d.lastActive)
              : 'never',
            dob: formatDateToReadable(d.dob),
            bio: d.bio || '',
            yearsOfExperience: d.yearsOfExperience || 0,
            hospitalAffiliation: d.hospitalAffiliation || 'none',
            servicesOffered,
            languagesSpoken: Array.isArray(d.languagesSpoken)
              ? d.languagesSpoken
              : [],
            certifications: Array.isArray(d.certifications)
              ? d.certifications
              : [],
            medicalLicenseNumber: d.medicalLicenseNumber || 'none',
            recordsReviewed: d.recordsReviewed || 0,
            identityAssets: {
              governmentIdUrl,
              medicalLicenseUrl,
            },
            doctorActivity: {
              patientsAttended: 0,
              recordsReviewed: d.recordsReviewed || 0,
              pendingApprovals,
            },
          } as IInspectDoctorResponse;
        }),
      );

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.DOCTOR_DATA_FETCHED,
        data: parsedDoctor[0],
      });
    } catch (e) {
      this.logger.error(
        `Error fetching doctor data for user: ${userId} : ${e}`,
      );
      throw new HttpException(
        new AdminError(
          AEM.ERROR_FETCHING_DOCTOR_DATA,
          { cause: e },
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAdminById(adminId: string) {
    try {
      const admin = await this.db.query.admin.findFirst({
        where: eq(schema.admin.id, adminId),
      });

      if (!admin) {
        return this.handler.handleReturn({
          status: HttpStatus.NOT_FOUND,
          message: AEM.ADMIN_NOT_FOUND,
        });
      }

      const strippedAdmin = {
        id: admin.id,
        email: admin.email,
        userName: admin.userName,
        permissions: admin.permissionLevel,
      };

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.ADMIN_FOUND,
        data: strippedAdmin,
      });
    } catch (e) {
      this.handler.handleError(e, AEM.ERROR_FINDING_ADMIN);
    }
  }

  async findAdminByEmail(email: string) {
    try {
      const admin = await this.db.query.admin.findFirst({
        where: eq(schema.admin.email, email),
      });

      if (!admin) {
        return this.handler.handleReturn({
          status: HttpStatus.NOT_FOUND,
          message: AEM.ADMIN_NOT_FOUND,
        });
      }

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.ADMIN_FOUND,
        data: admin,
      });
    } catch (e) {
      this.handler.handleError(e, AEM.ERROR_FINDING_ADMIN);
    }
  }

  async createSuperAdmin(ctx: ICreateAdmin) {
    const { userName, password, email, permissionLevel = 'super' } = ctx;
    try {
      const admin = await this.findAdminByEmail(email);

      if (admin?.data) {
        return this.handler.handleReturn({
          status: HttpStatus.CONFLICT,
          message: AEM.ADMIN_EXISTS,
        });
      }

      const hashedPassword = await this.authUtils.hash(password);

      await this.db.insert(schema.admin).values({
        userName,
        email,
        password: hashedPassword,
        permissionLevel,
      });

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.SUPER_ADMIN_CREATED,
      });
    } catch (e) {
      this.handler.handleError(e, AEM.ERROR_CREATING_ADMIN);
    }
  }

  async createSystemAdmin(ctx: ICreateSystemAdmin) {
    const {
      superAdminId,
      userName,
      password,
      email,
      permissionLevel = 'system',
    } = ctx;
    try {
      const [isSuperAdmin, isAdminExists] = await Promise.all([
        this.validateIsSuperAdmin(superAdminId),
        this.findAdminByEmail(email),
      ]);

      if (!isSuperAdmin) {
        throw new UnauthorizedException('Unauthorized');
      }

      if (isAdminExists?.data) {
        return this.handler.handleReturn({
          status: HttpStatus.CONFLICT,
          message: AEM.ADMIN_EXISTS,
        });
      }

      const hashedPassword = await this.authUtils.hash(password);

      await this.db.insert(schema.admin).values({
        userName,
        email,
        password: hashedPassword,
        permissionLevel,
      });

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.SUCCESS_CREATING_ADMIN,
      });
    } catch (e) {
      this.handler.handleError(e, AEM.ERROR_CREATING_ADMIN);
    }
  }

  async managePermissions(ctx: IManagePermissions) {
    const { superAdminId, adminId, permissionLevel } = ctx;
    try {
      const [isSuperAdmin, isAdmin] = await Promise.all([
        this.validateIsSuperAdmin(superAdminId),
        this.validateIsAdmin(adminId),
      ]);

      if (!isSuperAdmin || !isAdmin) {
        throw new UnauthorizedException('Unauthorized');
      }

      await this.db
        .update(schema.admin)
        .set({ permissionLevel })
        .where(eq(schema.admin.id, adminId));

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.SUCCESS_UPDATING_ADMIN_PERMISSIONS,
      });
    } catch (e) {
      this.handler.handleError(e, AEM.ERROR_UPDATING_ADMIN_PERMISSIONS);
    }
  }

  async adminLogin(ctx: IAdminLogin) {
    const { email, password } = ctx;
    try {
      const admin = await this.findAdminByEmail(email);

      if (!admin?.data) {
        throw new HttpException('Admin not found', HttpStatus.NOT_FOUND);
      }

      const isPasswordValid = await this.authUtils.compare({
        hashedPassword: admin.data.password!,
        password,
      });

      if (!isPasswordValid) {
        return this.handler.handleReturn({
          status: HttpStatus.UNAUTHORIZED,
          message: AEM.INVALID_ADMIN_PASSWORD,
        });
      }

      const tokens = await this.authService.generateTokens({
        email,
        userId: admin.data.id!,
        save: false,
      });

      const adminId = admin.data.id!;

      await this.db
        .update(schema.admin)
        .set({
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.admin.id, adminId));

      const data = {
        userId: admin.data.id!,
        email: admin.data.email!,
        profilePicture: admin.data.profilePicture!,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        role: USER_ROLE.ADMIN,
        permissionLevel: admin.data?.permissionLevel!,
      } as ILoginResponse;

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.SUCCESS_LOGGING_IN_AS_ADMIN,
        data,
      });
    } catch (e) {
      this.handler.handleError(e, AEM.ERROR_LOGGING_IN_AS_ADMIN);
    }
  }

  async verifyPractitioner(ctx: IVerifyPractitioner) {
    switch (ctx.role) {
      case 'doctor':
        return await this.verifyDoctor(ctx.practitionerId);
      case 'pharmacist':
        return 'Not Implemented';
      default:
        throw new BadRequestException('Invalid role');
    }
  }

  async deleteAdmin(ctx: IDeleteAdmin) {
    const { superAdminId, adminId } = ctx;
    try {
      const isSuperAdmin = await this.validateIsSuperAdmin(superAdminId);
      if (!isSuperAdmin) {
        throw new UnauthorizedException('Unauthorized');
      }

      await this.db.delete(schema.admin).where(eq(schema.admin.id, adminId));

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.SUCCESS_DELETING_ADMIN,
      });
    } catch (e) {
      this.handler.handleError(e, AEM.ERROR_DELETING_ADMIN);
    }
  }

  async suspendUser(ctx: ISuspendUser) {
    const { userId, reason = SUSPENSION_REASON.DEFAULT } = ctx;
    try {
      const userSuspended = await this.isUserSuspended(userId);
      if (userSuspended) {
        return this.handler.handleReturn({
          status: HttpStatus.OK,
          message: ASM.USER_ALREADY_SUSPENDED,
        });
      }

      await this.db.transaction(async (tx) => {
        await tx
          .update(schema.user)
          .set({
            status: USER_STATUS.SUSPENDED,
          })
          .where(eq(schema.user.id, userId));

        await tx.insert(schema.suspensionLogs).values({
          userId,
          reason,
        });
      });
      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.USER_SUSPENDED_SUCCESSFULLY,
      });
    } catch (e) {
      this.handler.handleError(e, AEM.ERROR_SUSPENDING_USER);
    }
  }

  async revokeSuspension(userId: string) {
    try {
      const userSuspended = await this.isUserSuspended(userId);
      if (!userSuspended) {
        return this.handler.handleReturn({
          status: HttpStatus.NOT_FOUND,
          message: ASM.USER_NOT_SUSPENDED,
        });
      }

      await this.db.transaction(async (tx) => {
        await tx
          .update(schema.user)
          .set({
            status: USER_STATUS.ACTIVE,
          })
          .where(eq(schema.user.id, userId));

        await tx
          .delete(schema.suspensionLogs)
          .where(eq(schema.suspensionLogs.userId, userId));
      });
      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.SUSPENSION_LIFTED_SUCCESSFULLY,
      });
    } catch (e) {
      this.handler.handleError(e, AEM.ERROR_REVOKING_SUSPENSION);
    }
  }

  async rejectUser(ctx: IRejectUser) {
    const { userId, reason } = ctx;
    try {
      const userResult = await this.userService.findUser(userId);

      if (!userResult?.data) {
        return this.handler.handleReturn({
          status: HttpStatus.NOT_FOUND,
          message: USER_ERROR_MESSAGES.USER_NOT_FOUND,
        });
      }

      const user = userResult.data;
      if (user.status === USER_STATUS.REJECTED) {
        return this.handler.handleReturn({
          status: HttpStatus.OK,
          message: ASM.USER_REJECTED_SUCCESSFULLY,
        });
      }

      await this.db.transaction(async (tx) => {
        await tx
          .update(schema.user)
          .set({
            status: USER_STATUS.REJECTED,
          })
          .where(eq(schema.user.id, userId));

        await tx.insert(schema.rejectionLogs).values({
          email: user.email,
          reason: reason || REJECTION_REASON.DEFAULT,
        });
      });

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.USER_REJECTED_SUCCESSFULLY,
      });
    } catch (e) {
      this.handler.handleError(e, AEM.ERROR_REJECTING_USER);
    }
  }

  async handleIsUserRejected(ctx: IHandleIsUserRejected) {
    const { userId, email } = ctx;
    let isUserRejected = false;
    try {
      let userEmail: string = email ? email : '';
      if (userId) {
        const userResult = await this.userService.findUser(userId);

        if (!userResult?.data) {
          return this.handler.handleReturn({
            status: HttpStatus.NOT_FOUND,
            message: USER_ERROR_MESSAGES.USER_NOT_FOUND,
          });
        }

        const user = userResult.data;
        userEmail = user.email;
      }

      const rejectedUser = await this.db.query.rejectionLogs.findFirst({
        where: eq(schema.rejectionLogs.email, userEmail),
      });

      if (rejectedUser?.id) {
        isUserRejected = true;
      }

      return isUserRejected;
    } catch (e) {
      throw new HttpException(
        new AdminError(
          'Error verifying user rejection',
          { cause: e },
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async fetchPatientManagementDashboard() {
    try {
      const [
        activeUserResult,
        doctorResult,
        patientResult,
        suspendedUsersCount,
      ] = await Promise.all([
        this.fetchActiveUsers(),
        this.doctorService.fetchAllDoctors({}),
        this.userService.fetchAllPatients({}),
        this.fetchSuspendedUsersCount(),
      ]);

      if (!doctorResult?.meta || !patientResult?.meta) {
        throw new HttpException(
          new AdminError(
            'Error fetching entities stats',
            { cause: 'Failed to fetch doctor or patient metadata' },
            HttpStatus.INTERNAL_SERVER_ERROR,
          ),
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const doctorCount = doctorResult.meta.totalCount;
      const patientCount = patientResult.meta.totalCount;
      const activeUsersCount = activeUserResult.length;
      const suspendedCount = suspendedUsersCount;

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.PATIENT_MANAGEMENT_DASHBOARD_FETCHED,
        data: {
          totalActiveUsers: activeUsersCount,
          totalPatients: patientCount,
          totalDoctors: doctorCount,
          totalSuspendedUsers: suspendedCount,
        },
      });
    } catch (e) {
      this.handler.handleError(
        e,
        AEM.ERROR_FETCHING_PATIENT_MANAGEMENT_DASHBOARD,
      );
    }
  }

  async fetchAllDoctors(ctx: IFetchDoctors) {
    const allDoctors = await this.doctorService.fetchAllDoctors(ctx);

    if (!allDoctors?.data) {
      throw new HttpException(
        new AdminError(
          'Error fetching doctors',
          { cause: 'Failed to fetch doctors data' },
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const doctorData = allDoctors.data;
    const parsedDoctorData = doctorData.map((doctor) => {
      return {
        email: doctor.email,
        fullName: doctor.fullName,
        phoneNumber: doctor.phoneNumber,
        gender: doctor.gender,
        profilePicture: doctor.profilePicture || '',
        role: doctor.role,
        userId: doctor.userId,
        status: doctor.status,
        lastActive: doctor.lastActive!,
      } as IUserSnippet;
    });

    return this.handler.handleReturn({
      status: HttpStatus.OK,
      message: allDoctors.message,
      data: parsedDoctorData,
      meta: allDoctors.meta,
    });
  }

  async fetchAllPatients(ctx: IFetchPatients) {
    return await this.userService.fetchAllPatients(ctx);
  }

  async fetchAllUsers(ctx: IFetchUsers) {
    return await this.userService.fetchAllUsers(ctx);
  }

  async fetchUserData(userId: string) {
    const role = await this.userService.determineUserRole(userId);
    this.logger.debug(`User role: ${role}`);
    switch (role) {
      case 'PATIENT':
        return await this.inspectPatientData(userId);
      case 'DOCTOR':
        return await this.inspectDoctorData(userId);
      default:
        'Role not implemented yet';
    }
  }

  async fetchApprovalManagementData(ctx: IFetchApprovalManagementData) {
    const { page = 1, limit = 12, sort = 'desc', filter } = ctx;
    const skip = (page - 1) * limit;
    const sortFn = sort === 'desc' ? desc : asc;
    const sortColumn = schema.user.createdAt;
    try {
      let whereConditions: any = and(
        eq(schema.user.role, USER_ROLE.DOCTOR),
        eq(schema.doctors.isVerified, false),
      );
      if (filter && filter === USER_ROLE.DOCTOR) {
        whereConditions = and(
          eq(schema.user.role, USER_ROLE.DOCTOR),
          eq(schema.doctors.isVerified, false),
        );
      }

      const totalUserResult = await this.db
        .select({ count: sql`count(*)`.as('count') })
        .from(schema.user)
        .leftJoin(schema.doctors, eq(schema.user.id, schema.doctors.userId))
        .where(whereConditions);

      const totalCount = Number(totalUserResult[0]?.count ?? 0);
      const totalPages = Math.ceil(totalCount / limit);

      const users = await this.db
        .select({
          userId: schema.user.id,
          fullName: schema.user.fullName,
          role: schema.user.role,
          createdAt: schema.user.createdAt,
          specialization: schema.doctors.specialization,
          medicalLicenseNumber: schema.doctors.medicalLicenseNumber,
        })
        .from(schema.user)
        .leftJoin(schema.doctors, eq(schema.user.id, schema.doctors.userId))
        .where(whereConditions)
        .orderBy(sortFn(sortColumn))
        .offset(skip)
        .limit(limit);

      const approvalData = users.map((user) => {
        return {
          userId: user.userId,
          fullName: user.fullName,
          licenseId: user.medicalLicenseNumber || 'Unknown',
          specialty: user.specialization || 'Unknown',
          userType: user.role,
          createdAt: formatDateToStandard(user.createdAt),
        } as IApprovalDashboardResponse;
      });
      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.APPROVAL_MANAGEMENT_DATA_FETCHED,
        data: approvalData,
        meta: {
          currentPage: page,
          totalPages,
          totalCount,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      });
    } catch (e) {
      this.handler.handleError(e, AEM.ERROR_FETCHING_APPROVAL_MANAGEMENT_DATA);
    }
  }

  async deleteUser(userId: string) {
    return await this.userService.deleteUser({
      userId,
    });
  }

  async deleteUserMoodMetrics(userId: string) {
    try {
      const user = await this.userService.findUser(userId);

      await this.db
        .delete(schema.moodMetrics)
        .where(eq(schema.moodMetrics.userId, userId));

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: 'User mood metrics deleted successfully',
      });
    } catch (e) {
      this.handler.handleError(e, AEM.ERROR_DELETING_USER_MOOD_METRICS);
    }
  }

  async clearUserHealthJournal(userId: string) {
    try {
      const user = await this.userService.findUser(userId);

      await this.db
        .delete(schema.health_journal)
        .where(eq(schema.health_journal.userId, userId));

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.HEALTH_JOURNAL_CLEARED_SUCCESSFULLY,
      });
    } catch (e) {
      this.handler.handleError(e, AEM.ERROR_CLEARING_USER_HEALTH_JOURNAL);
    }
  }

  async fetchAllSubscribers(ctx: IFetchAllContacts) {
    return await this.newsletterService.fetchAllSubscribers(ctx);
  }
}
