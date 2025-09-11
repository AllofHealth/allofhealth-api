import { Duration } from '@/modules/contract/data/contract.data';
import {
  IHandleApproval,
  TAccess,
} from '@/modules/contract/interface/contract.interface';
import { ContractService } from '@/modules/contract/service/contract.service';
import { DOCTOR_ERROR_MESSGAES } from '@/modules/doctor/data/doctor.data';
import { USER_ERROR_MESSAGES } from '@/modules/user/data/user.data';
import * as schema from '@/schemas/schema';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { EOnUserLogin, EUpdateTaskCount } from '@/shared/dtos/event.dto';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { SharedEvents } from '@/shared/events/shared.events';
import { AccountAbstractionService } from '@/shared/modules/account-abstraction/service/account-abstraction.service';
import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { and, count, eq, ne, or, sql } from 'drizzle-orm';
import {
  APPROVAL_ERROR_MESSAGE as AEM,
  APPROVAL_STATUS,
  APPROVAL_SUCCESS_MESSAGE as ASM,
} from '../data/approval.data';
import {
  IAcceptApproval,
  IFetchDoctorApprovals,
  IFetchPatientApprovals,
  IRejectApproval,
  IResetApprovalPermissions,
  IValidateApprovalDuration,
  IValidatePractitionerIsApproved,
} from '../interface/approval.interface';
import { calculateAge, formatDuration } from '@/shared/utils/date.utils';
import { UserService } from '@/modules/user/service/user.service';
import { ApprovalError } from '../error/approval.error';

@Injectable()
export class ApprovalProvider {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
    private readonly handler: ErrorHandler,
    private readonly aaService: AccountAbstractionService,
    private readonly contractService: ContractService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async getSmartAddress(practitionerId: string) {
    const result = await this.aaService.getSmartAddress(practitionerId);

    if (!result?.data) {
      throw new BadRequestException('Failed to get smart address');
    }

    return result.data.smartAddress;
  }

  private async practitionerCompliance(practitionerId: string) {
    let isCompliant: boolean = false;
    try {
      const practitioner = await this.db.query.user.findFirst({
        where: and(
          eq(schema.user.id, practitionerId),
          eq(schema.user.role, 'DOCTOR'),
        ),
      });

      if (practitioner) {
        isCompliant = true;
      }

      return isCompliant;
    } catch (e) {
      throw new InternalServerErrorException(
        `${AEM.ERROR_VERIFYING_PRACTITIONER}, ${e}`,
      );
    }
  }

  private async patientCompliance(userId: string) {
    let isCompliant = false;
    try {
      const user = await this.db
        .select({
          role: schema.user.role,
        })
        .from(schema.user)
        .where(eq(schema.user.id, userId));

      if (!user || user.length === 0) {
        throw new NotFoundException(USER_ERROR_MESSAGES.USER_NOT_FOUND);
      }

      const role = user[0].role;
      if (role === 'PATIENT') {
        isCompliant = true;
      }

      return isCompliant;
    } catch (e) {
      throw new InternalServerErrorException(
        `${AEM.ERROR_VERIFYING_PATIENT}, ${e}`,
      );
    }
  }

  async createApproval(ctx: IHandleApproval) {
    const {
      practitionerId,
      userId,
      accessLevel,
      duration = Duration.A_DAY,
      recordIds = [],
      shareHealthInfo = false,
    } = ctx;
    try {
      await this.userService.checkUserSuspension(userId);
      const [isPatient, isPractitioner] = await Promise.all([
        this.patientCompliance(userId),
        this.practitionerCompliance(practitionerId),
      ]);

      if (!isPatient) {
        return this.handler.handleReturn({
          status: HttpStatus.UNAUTHORIZED,
          message: AEM.PATIENT_ONLY,
        });
      }

      if (!isPractitioner) {
        return this.handler.handleReturn({
          status: HttpStatus.BAD_REQUEST,
          message: AEM.NOT_A_VALID_PRACTITIONER,
        });
      }

      const isVerifiedResult = await this.db
        .select({ isVerified: schema.doctors.isVerified })
        .from(schema.doctors)
        .where(eq(schema.doctors.userId, practitionerId));

      const isVerified = isVerifiedResult[0].isVerified;
      if (!isVerified) {
        return this.handler.handleReturn({
          status: HttpStatus.BAD_REQUEST,
          message: AEM.PRACTITIONER_NOT_VERIFIED,
        });
      }

      if (accessLevel === 'full') {
        if (!recordIds || recordIds.length === 0) {
          return this.handler.handleReturn({
            status: HttpStatus.BAD_REQUEST,
            message: AEM.RECORD_ID_IS_REQUIRED,
          });
        }

        for (const recordId of recordIds) {
          const existingApproval = await this.db
            .select({ id: schema.approvals.id })
            .from(schema.approvals)
            .where(
              and(
                eq(schema.approvals.recordId, recordId),
                eq(schema.approvals.userId, userId),
                ne(schema.approvals.status, APPROVAL_STATUS.TIMED_OUT),
                or(
                  eq(schema.approvals.accessLevel, 'write'),
                  eq(schema.approvals.accessLevel, 'full'),
                ),
              ),
            )
            .limit(1);

          if (existingApproval.length > 0) {
            return this.handler.handleReturn({
              status: HttpStatus.BAD_REQUEST,
              message: `${AEM.APPROVAL_ALREADY_EXISTS} for record ID: ${recordId}`,
            });
          }
        }
      }

      const practitionerAddress = await this.getSmartAddress(practitionerId);

      const result = await this.db.transaction(async (tx) => {
        let healthInfoId: string | undefined;

        if (shareHealthInfo) {
          const healthInfo = await tx.query.healthInformation.findFirst({
            where: eq(schema.healthInformation.userId, userId),
          });

          if (!healthInfo) {
            throw new Error(AEM.HEALTH_INFO_NOT_FOUND);
          }

          healthInfoId = healthInfo.id;
        }

        const createdApprovals: any[] = [];

        if (!recordIds || recordIds.length === 0) {
          const approval = await tx
            .insert(schema.approvals)
            .values({
              userId,
              recordId: null,
              practitionerAddress,
              accessLevel: accessLevel,
              duration,
              userHealthInfoId: healthInfoId,
            })
            .returning();

          if (!approval || approval.length === 0) {
            throw new Error(AEM.ERROR_CREATING_APPROVAL);
          }

          createdApprovals.push(...approval);
        } else {
          for (const recordId of recordIds) {
            const approval = await tx
              .insert(schema.approvals)
              .values({
                userId,
                recordId,
                practitionerAddress,
                accessLevel: accessLevel,
                duration,
                userHealthInfoId: healthInfoId,
              })
              .returning();

            if (!approval || approval.length === 0) {
              throw new Error(
                `${AEM.ERROR_CREATING_APPROVAL} for record ID: ${recordId}`,
              );
            }

            createdApprovals.push(...approval);
          }
        }

        return createdApprovals;
      });
      this.eventEmitter.emit(
        SharedEvents.UPDATE_USER_LOGIN,
        new EOnUserLogin(userId, new Date(), new Date()),
      );
      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.APPROVAL_CREATED,
        data: {
          approvalIds: result.map((approval) => approval.id),
          totalCreated: result.length,
        },
      });
    } catch (e) {
      this.handler.handleError(e, AEM.ERROR_CREATING_APPROVAL);
    }
  }

  async fetchDoctorPendingApprovalsCount(doctorId: string) {
    try {
      const doctorAddress = await this.getSmartAddress(doctorId);
      const pendingApprovals = await this.db
        .select({
          count: count(),
        })
        .from(schema.approvals)
        .where(
          and(
            eq(schema.approvals.status, APPROVAL_STATUS.PENDING),
            eq(schema.approvals.practitionerAddress, doctorAddress),
          ),
        );

      return pendingApprovals[0].count;
    } catch (e) {
      throw new InternalServerErrorException(
        new ApprovalError(AEM.ERROR_FETCHING_DOCTOR_PENDING_APPROVALS, {
          cause: e,
        }),
      );
    }
  }

  async fetchDoctorApprovals(ctx: IFetchDoctorApprovals) {
    const { userId, page = 1, limit = 12, status = 'CREATED' } = ctx;
    const skip = (page - 1) * limit;
    try {
      const isCompliant = await this.practitionerCompliance(userId);
      if (!isCompliant) {
        return this.handler.handleReturn({
          status: HttpStatus.BAD_REQUEST,
          message: AEM.NOT_A_VALID_PRACTITIONER,
        });
      }

      const doctorAddress = await this.getSmartAddress(userId);

      let whereClause: any = eq(
        schema.approvals.practitionerAddress,
        doctorAddress,
      );
      if (status) {
        whereClause = and(whereClause, eq(schema.approvals.status, status));
      }

      const totalDoctorApprovalsResult = await this.db
        .select({ count: sql`count(*)`.as('count') })
        .from(schema.approvals)
        .where(eq(schema.approvals.practitionerAddress, doctorAddress));

      const totalCount = Number(totalDoctorApprovalsResult[0]?.count ?? 0);
      const totalPages = Math.ceil(totalCount / limit);

      const approvals = await this.db
        .select({
          id: schema.approvals.id,
          userId: schema.approvals.userId,
          practitionerAddress: schema.approvals.practitionerAddress,
          recordId: schema.approvals.recordId,
          duration: schema.approvals.duration,
          createdAt: schema.approvals.createdAt,
          updatedAt: schema.approvals.updatedAt,
          accessLevel: schema.approvals.accessLevel,
          isRequestAccepted: schema.approvals.isRequestAccepted,
          patientFullName: schema.user.fullName,
        })
        .from(schema.approvals)
        .innerJoin(schema.user, eq(schema.approvals.userId, schema.user.id))
        .where(whereClause)
        .limit(limit)
        .offset(skip);

      this.eventEmitter.emit(
        SharedEvents.UPDATE_USER_LOGIN,
        new EOnUserLogin(userId, new Date(), new Date()),
      );

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.APPROVAL_FETCHED,
        data: approvals,
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
      this.handler.handleError(e, AEM.ERROR_FETCHING_DOCTOR_APPROVAL);
    }
  }

  async acceptApproval(ctx: IAcceptApproval) {
    const { doctorId, approvalId } = ctx;
    try {
      await this.userService.checkUserSuspension(doctorId);
      const isCompliant = await this.practitionerCompliance(doctorId);
      if (!isCompliant) {
        return this.handler.handleReturn({
          status: HttpStatus.BAD_REQUEST,
          message: AEM.NOT_A_VALID_PRACTITIONER,
        });
      }

      const isOtpVerifiedResult = await this.db.query.user.findFirst({
        where: and(eq(schema.user.id, doctorId)),
      });

      if (!isOtpVerifiedResult) {
        return this.handler.handleReturn({
          status: HttpStatus.NOT_FOUND,
          message: DOCTOR_ERROR_MESSGAES.DOCTOR_NOT_FOUND,
        });
      }

      const isOtpVerified = isOtpVerifiedResult.isOtpVerified;

      if (!isOtpVerified) {
        return this.handler.handleReturn({
          status: HttpStatus.UNAUTHORIZED,
          message: AEM.OTP_NOT_VERIFIED,
        });
      }

      const doctorAddress = await this.getSmartAddress(doctorId);
      const approval = await this.db.query.approvals.findFirst({
        where: and(
          eq(schema.approvals.id, approvalId),
          eq(schema.approvals.practitionerAddress, doctorAddress),
        ),
      });

      if (!approval || typeof approval === undefined) {
        return this.handler.handleReturn({
          status: HttpStatus.NOT_FOUND,
          message: AEM.APPROVAL_NOT_FOUND,
        });
      }

      if (approval.isRequestAccepted) {
        return this.handler.handleReturn({
          status: HttpStatus.CONFLICT,
          message: AEM.APPROVAL_REQUEST_CONFLICT,
        });
      }
      const previousDate = approval.updatedAt;

      await this.db.update(schema.approvals).set({
        isRequestAccepted: true,
        updatedAt: new Date().toISOString(),
        status: APPROVAL_STATUS.ACCEPTED,
      });

      const approvalContractResult =
        await this.contractService.handleRecordApproval({
          userId: approval.userId,
          accessLevel: approval.accessLevel as TAccess,
          practitionerId: doctorId,
          duration: approval.duration || undefined,
          recordIds: approval.recordId ? [approval.recordId] : undefined,
        });

      if (approvalContractResult.status !== HttpStatus.OK) {
        await this.db.update(schema.approvals).set({
          isRequestAccepted: false,
          updatedAt: previousDate,
          status: APPROVAL_STATUS.CREATED,
        });
        return this.handler.handleReturn({
          status: approvalContractResult.status,
          message: approvalContractResult.message,
        });
      }

      const taskData = new EUpdateTaskCount(
        doctorId,
        'ACCEPT_APPROVAL',
        approvalId,
      );

      this.eventEmitter.emit(
        SharedEvents.UPDATE_USER_LOGIN,
        new EOnUserLogin(doctorId, new Date(), new Date()),
      );

      this.eventEmitter.emit(SharedEvents.TASK_COMPLETED, taskData);
      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.APPROVAL_ACCEPTED,
      });
    } catch (e) {
      this.handler.handleError(e, AEM.ERROR_ACCEPTING_APPROVAL);
    }
  }

  async rejectApproval(ctx: IRejectApproval) {
    const { doctorId, approvalId } = ctx;
    try {
      const isCompliant = await this.practitionerCompliance(doctorId);
      if (!isCompliant) {
        return this.handler.handleReturn({
          status: HttpStatus.BAD_REQUEST,
          message: AEM.NOT_A_VALID_PRACTITIONER,
        });
      }

      const doctorAddress = await this.getSmartAddress(doctorId);
      const approval = await this.db.query.approvals.findFirst({
        where: and(
          eq(schema.approvals.id, approvalId),
          eq(schema.approvals.practitionerAddress, doctorAddress),
        ),
      });

      if (!approval || typeof approval === undefined) {
        return this.handler.handleReturn({
          status: HttpStatus.NOT_FOUND,
          message: AEM.APPROVAL_NOT_FOUND,
        });
      }

      await this.db
        .update(schema.approvals)
        .set({
          status: APPROVAL_STATUS.REJECTED,
          isRequestAccepted: false,
        })
        .where(
          and(
            eq(schema.approvals.id, approvalId),
            eq(schema.approvals.practitionerAddress, doctorAddress),
          ),
        );

      this.eventEmitter.emit(
        SharedEvents.UPDATE_USER_LOGIN,
        new EOnUserLogin(doctorId, new Date(), new Date()),
      );

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.APPROVAL_REJECTED,
      });
    } catch (e) {
      this.handler.handleError(e, AEM.ERROR_REJECTING_APPROVAL);
    }
  }

  validateApprovalDuration(ctx: IValidateApprovalDuration) {
    const { createdAt, duration } = ctx;
    let isValid: boolean = false;

    const currentTime = Date.now();
    const createdAtTime = new Date(createdAt).getTime();

    const expirationTime = createdAtTime + duration;

    if (currentTime <= expirationTime) {
      isValid = true;
    }

    return isValid;
  }

  async validatePractitionerIsApproved(ctx: IValidatePractitionerIsApproved) {
    let isPractitionerApproved: boolean = false;

    const { practitionerAddress, userId, recordId, approvalId } = ctx;

    try {
      const approval = await this.db.query.approvals.findFirst({
        where: and(
          eq(schema.approvals.practitionerAddress, practitionerAddress),
          eq(schema.approvals.userId, userId),
          eq(schema.approvals.id, approvalId),
        ),
      });

      console.debug(JSON.stringify(approval));

      if (!approval || typeof approval === undefined) {
        throw new HttpException(AEM.APPROVAL_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      if (!approval.isRequestAccepted) {
        throw new HttpException(
          AEM.APPROVAL_NOT_ACCEPTED,
          HttpStatus.FORBIDDEN,
        );
      }

      if (recordId) {
        if (recordId !== approval.recordId) {
          throw new UnauthorizedException(
            'Practitioner not allowed to view this record',
          );
        }

        if (!approval.duration) {
          return {
            isApproved: true,
            permissions: approval.accessLevel,
          };
        } else {
          const isDurationValid = this.validateApprovalDuration({
            createdAt: approval.createdAt,
            duration: approval.duration,
          });

          return {
            isApproved: isDurationValid,
            permissions: approval.accessLevel,
          };
        }
      }

      const isDurationValid = this.validateApprovalDuration({
        createdAt: approval.createdAt,
        duration: approval.duration as number,
      });

      isPractitionerApproved = isDurationValid;

      return {
        isApproved: isPractitionerApproved,
        permissions: approval.accessLevel,
      };
    } catch (e) {
      throw new HttpException(
        AEM.ERROR_VALIDATING_APPROVAL_ACCESS,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findApprovalById(approvalId: string) {
    try {
      const approvals = await this.db
        .select({
          id: schema.approvals.id,
          userId: schema.approvals.userId,
          practitionerAddress: schema.approvals.practitionerAddress,
          recordId: schema.approvals.recordId,
          duration: schema.approvals.duration,
          createdAt: schema.approvals.createdAt,
          updatedAt: schema.approvals.updatedAt,
          accessLevel: schema.approvals.accessLevel,
          isRequestAccepted: schema.approvals.isRequestAccepted,
          status: schema.approvals.status,
          patientFullName: schema.user.fullName,
          email: schema.user.emailAddress,
          userHealthInfoId: schema.approvals.userHealthInfoId || null,
          gender: schema.user.gender,
          dob: schema.user.dateOfBirth,
          knownConditions: schema.healthInformation.knownConditions,
        })
        .from(schema.approvals)
        .innerJoin(schema.user, eq(schema.approvals.userId, schema.user.id))
        .innerJoin(
          schema.healthInformation,
          eq(schema.healthInformation.userId, schema.user.id),
        )
        .where(eq(schema.approvals.id, approvalId))
        .limit(1);

      if (!approvals || approvals.length === 0) {
        return this.handler.handleReturn({
          status: HttpStatus.NOT_FOUND,
          message: AEM.APPROVAL_NOT_FOUND,
        });
      }

      const parsedApproval = approvals.map((approval) => {
        const parsedAge = calculateAge(approval.dob);
        const parsedDuration = formatDuration(approval.duration as number);

        return {
          ...approval,
          age: parsedAge,
          duration: parsedDuration,
          knownConditions: approval.knownConditions || [],
        };
      });

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.APPROVAL_FOUND,
        data: parsedApproval[0],
      });
    } catch (e) {
      this.handler.handleError(e, AEM.ERROR_FINDING_APPROVAL);
    }
  }

  async fetchApprovedApprovals(userId: string) {
    try {
      const isCompliant = await this.practitionerCompliance(userId);
      if (!isCompliant) {
        return this.handler.handleReturn({
          status: HttpStatus.BAD_REQUEST,
          message: AEM.NOT_A_VALID_PRACTITIONER,
        });
      }

      const smartAddressResult = await this.aaService.getSmartAddress(userId);
      if (!smartAddressResult?.data) {
        throw new Error('Failed to get smart address');
      }

      const smartAddress = smartAddressResult.data.smartAddress;

      const approvals = await this.db
        .select({
          id: schema.approvals.id,
          userId: schema.approvals.userId,
          practitionerAddress: schema.approvals.practitionerAddress,
          recordId: schema.approvals.recordId,
          duration: schema.approvals.duration,
          createdAt: schema.approvals.createdAt,
          updatedAt: schema.approvals.updatedAt,
          accessLevel: schema.approvals.accessLevel,
          isRequestAccepted: schema.approvals.isRequestAccepted,
          patientFullName: schema.user.fullName,
          email: schema.user.emailAddress,
          userHealthInfoId: schema.approvals.userHealthInfoId || null,
          gender: schema.user.gender,
          dob: schema.user.dateOfBirth,
          knownConditions: schema.healthInformation.knownConditions,
        })
        .from(schema.approvals)
        .innerJoin(schema.user, eq(schema.approvals.userId, schema.user.id))
        .innerJoin(
          schema.healthInformation,
          eq(schema.healthInformation.userId, schema.user.id),
        )
        .where(
          and(
            eq(schema.approvals.practitionerAddress, smartAddress),
            eq(schema.approvals.isRequestAccepted, true),
          ),
        );

      if (!approvals || approvals.length === 0) {
        return this.handler.handleReturn({
          status: HttpStatus.OK,
          message: ASM.NO_APPROVALS_FOUND,
          data: [],
        });
      }

      const parsedApprovals = approvals.map((approval) => {
        const parsedAge = calculateAge(approval.dob);
        const parsedDuration = formatDuration(approval.duration as number);

        return {
          ...approval,
          age: parsedAge,
          duration: parsedDuration,
          knownConditions: approval.knownConditions || [],
        };
      });

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.APPROVED_APPROVALS_FETCHED,
        data: parsedApprovals,
      });
    } catch (e) {
      this.handler.handleError(e, AEM.ERROR_FETCHING_APPROVED_APPROVALS);
    }
  }

  async deleteApproval(approvalId: string) {
    try {
      const approvalResult = await this.findApprovalById(approvalId);

      await this.db
        .delete(schema.approvals)
        .where(eq(schema.approvals.id, approvalId));

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.APPROVAL_DELETED,
      });
    } catch (e) {
      this.handler.handleError(e, AEM.ERROR_DELETING_APPROVAL);
    }
  }

  async fetchApproval(approvalId: string) {
    try {
      const approval = await this.db.query.approvals.findFirst({
        where: eq(schema.approvals.id, approvalId),
      });

      if (!approval || typeof approval === undefined) {
        return this.handler.handleReturn({
          status: HttpStatus.NOT_FOUND,
          message: AEM.APPROVAL_NOT_FOUND,
        });
      }

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.APPROVAL_FOUND,
        data: approval,
      });
    } catch (e) {
      this.handler.handleError(e, AEM.ERROR_FETCHING_APPROVAL);
    }
  }

  async fetchPatientApprovals(ctx: IFetchPatientApprovals) {
    const { userId, page = 1, limit = 12, status } = ctx;
    const skip = (page - 1) * limit;
    try {
      let whereClause: any = eq(schema.approvals.userId, userId);
      if (status) {
        whereClause = and(whereClause, eq(schema.approvals.status, status));
      }
      await this.userService.checkUserSuspension(userId);
      const totalPatientApprovalsResult = await this.db
        .select({ count: sql`count(*)`.as('count') })
        .from(schema.approvals)
        .where(eq(schema.approvals.userId, userId));

      const totalCount = Number(totalPatientApprovalsResult[0]?.count ?? 0);
      const totalPages = Math.ceil(totalCount / limit);

      const patientApprovals = await this.db
        .select()
        .from(schema.approvals)
        .where(whereClause)
        .limit(limit)
        .offset(skip);

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.PATIENT_APPROVALS_FETCHED,
        data: patientApprovals,
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
      this.handler.handleError(e, AEM.ERROR_FETCHING_PATIENT_APPROVALS);
    }
  }

  async resetApprovalPermissions(ctx: IResetApprovalPermissions) {
    const { approvalId } = ctx;
    try {
      const approvalResult = await this.findApprovalById(approvalId);

      if (!approvalResult?.data) {
        throw new Error('Invalid approval data');
      }

      const approval = approvalResult.data;
      const newStatus = !approval.isRequestAccepted
        ? APPROVAL_STATUS.TIMED_OUT
        : APPROVAL_STATUS.COMPLETED;

      await this.db
        .update(schema.approvals)
        .set({
          isRequestAccepted: false,
          status: newStatus,
        })
        .where(eq(schema.approvals.id, approvalId));
    } catch (e) {
      this.handler.handleError(e, AEM.ERROR_RESETTING_APPROVAL_PERMISSIONS);
    }
  }
}
