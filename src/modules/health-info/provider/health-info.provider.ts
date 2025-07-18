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
} from '../interface/health-info.interface';
import {
  HEALTH_INFO_ERROR_MESSAGES as HEM,
  HEALTH_INFO_SUCCESS_MESSAGES as HSM,
} from '../data/health-info.data';
import { AssetService } from '@/modules/asset/service/asset.service';
import * as schema from '@/schemas/schema';

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
}
