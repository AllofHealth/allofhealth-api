import { ApprovalService } from '@/modules/approval/service/approval.service';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ICreateHealthInfo,
  IFetchHealthInfo,
  IHandleAttachmentUpload,
  IUpdateHealthInfo,
} from '../interface/health-info.interface';
import {
  HEALTH_INFO_ERROR_MESSAGES as HEM,
  HEALTH_INFO_SUCCESS_MESSAGES as HSM,
} from '../data/health-info.data';
import { AssetService } from '@/modules/asset/service/asset.service';
import * as schema from '@/schemas/schema';
import { eq } from 'drizzle-orm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SharedEvents } from '@/shared/events/shared.events';
import { EUpdateTaskCount } from '@/shared/dtos/event.dto';

@Injectable()
export class HealthInfoProvider {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
    private readonly approvalService: ApprovalService,
    private readonly handler: ErrorHandler,
    private readonly assetService: AssetService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async handleAttachmentUpload(ctx: IHandleAttachmentUpload) {
    const { attachmentFilePath, userId } = ctx;
    try {
      const uploadResult = await this.assetService.uploadProfilePicture({
        profilePictureFilePath: attachmentFilePath,
        userId,
        context: 'health-info',
      });

      if (!uploadResult?.data) {
        throw new HttpException(
          'Failed to upload file',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return {
        url: uploadResult.data.url,
        fileId: uploadResult.data.fileId,
      };
    } catch (e) {
      throw new InternalServerErrorException(
        `Error uploading attachment, ${e}`,
      );
    }
  }

  private async prepareRecordToUpdate(ctx: IUpdateHealthInfo) {
    const {
      userId,
      howAreYouFeeling,
      whenDidItStart,
      painLevel,
      knownConditions,
      medicationsTaken,
      attachmentFilePath,
    } = ctx;

    const dataToUpdate: Record<string, any> = {};

    if (howAreYouFeeling) {
      dataToUpdate.howAreYouFeeling = howAreYouFeeling;
    }
    if (whenDidItStart) {
      dataToUpdate.whenDidItStart = whenDidItStart;
    }
    if (painLevel) {
      dataToUpdate.painLevel = painLevel;
    }
    if (knownConditions) {
      dataToUpdate.knownConditions = knownConditions;
    }
    if (medicationsTaken) {
      dataToUpdate.medicationsTaken = medicationsTaken;
    }
    if (attachmentFilePath) {
      const { url, fileId } = await this.handleAttachmentUpload({
        userId,
        attachmentFilePath: attachmentFilePath,
      });

      dataToUpdate.attachment = url;
      dataToUpdate.attachmentFileId = fileId;
    }

    dataToUpdate.updatedAt = new Date();

    return dataToUpdate;
  }

  async createHealthInformation(ctx: ICreateHealthInfo) {
    const {
      userId,
      howAreYouFeeling,
      whenDidItStart,
      painLevel,
      knownConditions,
      medicationsTaken,
      attachmentFilePath,
    } = ctx;
    try {
      let attachmentUrl: string | null = null;
      let attachmentFileId: string | null = null;
      if (attachmentFilePath) {
        const { url, fileId } = await this.handleAttachmentUpload({
          userId,
          attachmentFilePath,
        });

        attachmentUrl = url;
        attachmentFileId = fileId;
      }

      const healthInfo = await this.db
        .insert(schema.healthInformation)
        .values({
          userId,
          howAreYouFeeling,
          whenDidItStart,
          painLevel,
          knownConditions,
          medicationsTaken,
          attachment: attachmentUrl,
          attachmentFileId,
        })
        .returning();

      const taskData = new EUpdateTaskCount(
        userId,
        'COMPLETE_HEALTH_INFO',
        healthInfo[0].id,
      );

      this.eventEmitter.emit(SharedEvents.TASK_COMPLETED, taskData);

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: HSM.HEALTH_INFO_CREATED,
      });
    } catch (e) {
      this.handler.handleError(e, HEM.ERROR_CREATING_HEALTH_INFO);
    }
  }

  async updateHealthInformation(ctx: IUpdateHealthInfo) {
    try {
      const dataToUpdate = await this.prepareRecordToUpdate(ctx);

      const healthInfo = await this.db
        .update(schema.healthInformation)
        .set(dataToUpdate)
        .where(eq(schema.healthInformation.userId, ctx.userId))
        .returning();

      const taskData = new EUpdateTaskCount(
        ctx.userId,
        'COMPLETE_HEALTH_INFO',
        healthInfo[0].id,
      );

      this.eventEmitter.emit(SharedEvents.TASK_COMPLETED, taskData);

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: HSM.HEALTH_INFO_UPDATED,
      });
    } catch (e) {
      this.handler.handleError(e, HEM.ERROR_UPDATING_HEALTH_INFO);
    }
  }

  async validateApprovedHealthAccess(ctx: Omit<IFetchHealthInfo, 'userId'>) {
    const { healthInfoId, approvalId } = ctx;
    let isAccessApproved: boolean = false;
    try {
      if (healthInfoId) {
        if (!approvalId) {
          throw new UnauthorizedException(HEM.UNAUTHORIZED);
        }

        const approval = await this.approvalService.fetchApproval(approvalId);
        if (!approval?.data) {
          throw new UnauthorizedException('Approval not found');
        }

        const approvalData = approval.data;

        if (
          !approvalData.userHealthInfoId ||
          healthInfoId !== approvalData.userHealthInfoId
        ) {
          throw new UnauthorizedException(HEM.UNAUTHORIZED);
        }

        const isApprovalValid = this.approvalService.validateApprovalDuration({
          createdAt: approvalData.createdAt,
          duration: approvalData.duration as number,
        });

        if (!isApprovalValid) {
          throw new UnauthorizedException(HEM.APPROVAL_EXPIRED);
        }

        isAccessApproved = true;
      }

      return isAccessApproved;
    } catch (e) {
      throw new InternalServerErrorException(
        `${HEM.ERROR_VALIDATING_HEALTH_ACCESS}, ${e}`,
      );
    }
  }

  async fetchHealthInformation(ctx: IFetchHealthInfo) {
    const { userId, approvalId, healthInfoId } = ctx;
    try {
      if (approvalId) {
        const isAccessValid = this.validateApprovedHealthAccess({
          approvalId,
          healthInfoId,
        });

        if (!isAccessValid) {
          return this.handler.handleReturn({
            status: HttpStatus.OK,
            message: HEM.HEALTH_INFO_ACCESS_DENIED,
          });
        }

        const patientHealthInfo = await this.db
          .select({
            howAreYouFeeling: schema.healthInformation.howAreYouFeeling,
            whenDidItStart: schema.healthInformation.whenDidItStart,
            painLevel: schema.healthInformation.painLevel,
            knownConditions: schema.healthInformation.knownConditions,
            medicationsTaken: schema.healthInformation.medicationsTaken,
            attachment: schema.healthInformation.attachment,
          })
          .from(schema.healthInformation)
          .where(eq(schema.healthInformation.id, healthInfoId as string))
          .limit(1);

        if (!patientHealthInfo || patientHealthInfo.length === 0) {
          return this.handler.handleReturn({
            status: HttpStatus.NOT_FOUND,
            message: HEM.HEALTH_INFO_NOT_FOUND,
          });
        }

        return this.handler.handleReturn({
          status: HttpStatus.OK,
          message: HSM.HEALTH_INFO_FETCHED,
          data: patientHealthInfo[0],
        });
      }

      const patientHealthInfo = await this.db
        .select({
          howAreYouFeeling: schema.healthInformation.howAreYouFeeling,
          whenDidItStart: schema.healthInformation.whenDidItStart,
          painLevel: schema.healthInformation.painLevel,
          knownConditions: schema.healthInformation.knownConditions,
          medicationsTaken: schema.healthInformation.medicationsTaken,
          attachment: schema.healthInformation.attachment,
        })
        .from(schema.healthInformation)
        .where(eq(schema.healthInformation.userId, userId))
        .limit(1);

      if (!patientHealthInfo || patientHealthInfo.length === 0) {
        return this.handler.handleReturn({
          status: HttpStatus.NOT_FOUND,
          message: HEM.HEALTH_INFO_NOT_FOUND,
        });
      }

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: HSM.HEALTH_INFO_FETCHED,
        data: patientHealthInfo[0],
      });
    } catch (e) {
      this.handler.handleError(e, HEM.ERROR_FETCHING_HEALTH_INFO);
    }
  }
}
