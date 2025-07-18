import { Duration } from '@/modules/contract/data/contract.data';
import {
  IHandleApproval,
  TAccess,
} from '@/modules/contract/interface/contract.interface';
import { ContractService } from '@/modules/contract/service/contract.service';
import * as schema from '@/schemas/schema';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { AccountAbstractionService } from '@/shared/modules/account-abstraction/service/account-abstraction.service';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { and, eq, or } from 'drizzle-orm';
import {
  APPROVAL_ERROR_MESSAGE as AEM,
  APPROVAL_SUCCESS_MESSAGE as ASM,
} from '../data/approval.data';
import { DOCTOR_ERROR_MESSGAES } from '@/modules/doctor/data/doctor.data';
import {
  IAcceptApproval,
  IRejectApproval,
  IValidateApprovalDuration,
  IValidatePractitionerIsApproved,
} from '../interface/approval.interface';
import { USER_ERROR_MESSAGES } from '@/modules/user/data/user.data';

@Injectable()
export class ApprovalProvider {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
    private readonly handler: ErrorHandler,
    private readonly aaService: AccountAbstractionService,
    private readonly contractService: ContractService,
  ) {}

  private async getSmartAddress(practitionerId: string) {
    const result = await this.aaService.getSmartAddress(practitionerId);

    if (!('data' in result && result.data)) {
      throw new BadRequestException(result.message);
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
      recordId,
      shareHealthInfo = false,
    } = ctx;
    try {
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

      if (accessLevel === 'write' || accessLevel === 'full') {
        if (!recordId) {
          return this.handler.handleReturn({
            status: HttpStatus.BAD_REQUEST,
            message: AEM.RECORD_ID_IS_REQUIRED,
          });
        }

        const existingApproval = await this.db
          .select({ id: schema.approvals.id })
          .from(schema.approvals)
          .where(
            and(
              eq(schema.approvals.recordId, recordId),
              eq(schema.approvals.userId, userId),
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
            message: AEM.APPROVAL_ALREADY_EXISTS,
          });
        }
      }

      const practitionerAddress = await this.getSmartAddress(practitionerId);

      if (shareHealthInfo) {
        const healthInfo = await this.db.query.healthInformation.findFirst({
          where: eq(schema.healthInformation.userId, userId),
        });

        if (!healthInfo) {
          return this.handler.handleReturn({
            status: HttpStatus.NOT_FOUND,
            message: AEM.HEALTH_INFO_NOT_FOUND,
          });
        }

        const healthInfoId = healthInfo.id;

        const approval = await this.db
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
          return this.handler.handleReturn({
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: AEM.ERROR_CREATING_APPROVAL,
          });
        }

        return this.handler.handleReturn({
          status: HttpStatus.OK,
          message: ASM.APPROVAL_CREATED,
          data: {
            approvalId: approval[0].id,
          },
        });
      }

      const approval = await this.db
        .insert(schema.approvals)
        .values({
          userId,
          recordId,
          practitionerAddress,
          accessLevel: accessLevel,
          duration,
        })
        .returning();

      if (!approval || approval.length === 0) {
        return this.handler.handleReturn({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: AEM.ERROR_CREATING_APPROVAL,
        });
      }

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.APPROVAL_CREATED,
        data: {
          approvalId: approval[0].id,
        },
      });
    } catch (e) {
      return this.handler.handleError(e, AEM.ERROR_CREATING_APPROVAL);
    }
  }

  async fetchDoctorApprovals(doctorId: string) {
    try {
      const isCompliant = await this.practitionerCompliance(doctorId);
      if (!isCompliant) {
        return this.handler.handleReturn({
          status: HttpStatus.BAD_REQUEST,
          message: AEM.NOT_A_VALID_PRACTITIONER,
        });
      }

      const doctorAddress = await this.getSmartAddress(doctorId);
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
        .where(eq(schema.approvals.practitionerAddress, doctorAddress));

      if (!approvals || approvals.length === 0) {
        return this.handler.handleReturn({
          status: HttpStatus.OK,
          message: AEM.APPROVALS_NOT_FOUND,
          data: [],
        });
      }

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.APPROVAL_FETCHED,
        data: approvals,
      });
    } catch (e) {
      return this.handler.handleError(e, AEM.ERROR_FETCHING_DOCTOR_APPROVAL);
    }
  }

  async acceptApproval(ctx: IAcceptApproval) {
    const { doctorId, approvalId } = ctx;
    try {
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

      const isOtpVerified = isOtpVerifiedResult[0].isOtpVeried;

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
      });

      const approvalContractResult =
        await this.contractService.handleRecordApproval({
          userId: approval.userId,
          accessLevel: approval.accessLevel as TAccess,
          practitionerId: doctorId,
          duration: approval.duration || undefined,
          recordId: approval.recordId || undefined,
        });

      if (approvalContractResult.status !== HttpStatus.OK) {
        await this.db.update(schema.approvals).set({
          isRequestAccepted: false,
          updatedAt: previousDate,
        });
        return this.handler.handleReturn({
          status: approvalContractResult.status,
          message: approvalContractResult.message,
        });
      }

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.APPROVAL_ACCEPTED,
      });
    } catch (e) {
      return this.handler.handleError(e, AEM.ERROR_ACCEPTING_APPROVAL);
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
        .delete(schema.approvals)
        .where(eq(schema.approvals.id, approvalId));

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.APPROVAL_REJECTED,
      });
    } catch (e) {
      return this.handler.handleError(e, AEM.ERROR_REJECTING_APPROVAL);
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
      return this.handler.handleError(e, AEM.ERROR_FINDING_APPROVAL);
    }
  }

  async deleteApproval(approvalId: string) {
    try {
      const approvalResult = await this.findApprovalById(approvalId);
      if (approvalResult.status !== HttpStatus.OK) return approvalResult;

      this.db
        .delete(schema.approvals)
        .where(eq(schema.approvals.id, approvalId));

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.APPROVAL_DELETED,
      });
    } catch (e) {
      return this.handler.handleError(e, AEM.ERROR_DELETING_APPROVAL);
    }
  }
}
