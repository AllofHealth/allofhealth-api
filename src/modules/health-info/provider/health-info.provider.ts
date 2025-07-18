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
} from '@nestjs/common';
import {
  ICreateHealthInfo,
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

@Injectable()
export class HealthInfoProvider {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
    private readonly approvalService: ApprovalService,
    private readonly handler: ErrorHandler,
    private readonly assetService: AssetService,
  ) {}

  private async handleAttachmentUpload(ctx: IHandleAttachmentUpload) {
    const { attachmentFilePath, userId } = ctx;
    try {
      const uploadResult = await this.assetService.uploadProfilePicture({
        profilePictureFilePath: attachmentFilePath,
        userId,
      });

      if (!('data' in uploadResult && uploadResult.data)) {
        throw new HttpException(uploadResult.message, uploadResult.status);
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
        userId: ctx.userId,
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

      await this.db.insert(schema.healthInformation).values({
        userId,
        howAreYouFeeling,
        whenDidItStart,
        painLevel,
        knownConditions,
        medicationsTaken,
        attachment: attachmentUrl,
        attachmentFileId,
      });

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: HSM.HEALTH_INFO_CREATED,
      });
    } catch (e) {
      return this.handler.handleError(e, HEM.ERROR_CREATING_HEALTH_INFO);
    }
  }

  async updateHealthInformation(ctx: IUpdateHealthInfo) {
    try {
      const dataToUpdate = await this.prepareRecordToUpdate(ctx);

      await this.db
        .update(schema.healthInformation)
        .set(dataToUpdate)
        .where(eq(schema.healthInformation.userId, ctx.userId));

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: HSM.HEALTH_INFO_UPDATED,
      });
    } catch (e) {
      return this.handler.handleError(e, HEM.ERROR_UPDATING_HEALTH_INFO);
    }
  }
}
