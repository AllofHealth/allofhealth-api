import { IpfsConfig } from '@/shared/config/ipfs/ipfs.config';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import {
  CustomIpfsClient,
  IpfsClientService,
} from '../ipfs-client/ipfs-client.service';
import {
  IDeleteRecordFromIpfs,
  IFindPathFromCid,
  IHandleFileUploads,
  IMedicalRecord,
  IpfsRecord,
} from '../interface/ipfs.interface';
import {
  IPFS_ERROR_MESSAGES as IEM,
  IPFS_SUCCESS_MESSAGES as ISM,
} from '../data/ipfs.data';

@Injectable()
export class IpfsProvider implements OnModuleInit {
  private ipfsClient: any;

  constructor(
    private readonly ipfsConfig: IpfsConfig,
    private readonly handler: ErrorHandler,
    private readonly ipfsClientService: IpfsClientService,
  ) {}

  async onModuleInit() {
    try {
      const config: any = {
        host: this.ipfsConfig.IPFS_HOST,
        port: this.ipfsConfig.IPFS_PORT,
        protocol: this.ipfsConfig.IPFS_PROTOCOL,
      };

      if (this.ipfsConfig.IPFS_API_KEY && this.ipfsConfig.IPFS_API_SECRET) {
        config.headers = {
          authorization: this.createAuth(),
        };
      }

      this.ipfsClient = await this.ipfsClientService.createClient(config);
    } catch (error) {
      this.handler.handleError(error, 'Failed to initialize IPFS client');
    }
  }

  private createAuth() {
    const auth =
      'Basic ' +
      Buffer.from(
        `${this.ipfsConfig.IPFS_API_KEY}:${this.ipfsConfig.IPFS_API_SECRET}`,
      ).toString('base64');

    return auth;
  }

  getIpfsClient() {
    if (!this.ipfsClient) {
      throw new Error('IPFS client not initialized');
    }
    return this.ipfsClient as CustomIpfsClient;
  }

  async testIPFS() {
    try {
      const ipfs = this.getIpfsClient();
      const result = await ipfs.add(Buffer.from('Hello, IPFS!'));

      const response = {
        hash: result.cid.toString(),
        name: result.path,
        size: result.size,
      };

      return response;
    } catch (error) {
      this.handler.handleError(error, 'Failed to upload record to IPFS');
      throw error;
    }
  }

  async handleFileUploads(ctx: IHandleFileUploads) {
    const { files, userId } = ctx;
    const ipfs = this.getIpfsClient();

    let uploadedImageCid: string[] = [];

    await Promise.all(
      files.map(async (file) => {
        try {
          const uploadResult = await ipfs.uploadImage(file, userId);

          console.log(`upload result ${JSON.stringify(uploadResult)}`);

          if (uploadResult.cid) {
            const cid = uploadResult.cid.toString();
            await ipfs.pin(cid);
            uploadedImageCid.push(cid);
          }
        } catch (error) {
          console.error(`Failed to upload file ${file.originalname}:`, error);
          throw error;
        }
      }),
    );

    return uploadedImageCid;
  }

  async handleRecordUpload(ctx: IMedicalRecord) {
    try {
      let attachmentCids: string[] = [];

      if (ctx.attachments && ctx.attachments.length > 0) {
        attachmentCids = await this.handleFileUploads({
          files: ctx.attachments,
          userId: ctx.userId,
        });
      }

      const recordData: IpfsRecord = {
        userId: ctx.userId,
        title: ctx.title,
        clinicalNotes: ctx.clinicalNotes,
        diagnosis: ctx.diagnosis,
        labResults: ctx.labResults,
        medicationsPrscribed: ctx.medicationsPrscribed,
        attachments: attachmentCids,
        uploadedAt: new Date().toISOString(),
      };

      const ipfs = this.getIpfsClient();

      const recordJson = JSON.stringify(recordData, null, 2);
      const uploadResult = await ipfs.add(recordJson, ctx.userId);

      if (uploadResult.cid) {
        const cid = uploadResult.cid.toString();

        await ipfs.pin(cid);

        return this.handler.handleReturn({
          status: HttpStatus.OK,
          message: ISM.SUCCESS_UPLOADING_RECORD,
          data: cid,
        });
      }

      throw new Error('Failed to upload medical record: No CID returned');
    } catch (e) {
      return this.handler.handleError(e, IEM.ERROR_UPLOADING_RECORD);
    }
  }

  async fetchRecord(cid: string) {
    try {
      const ipfs = this.getIpfsClient();

      const buffer = await ipfs.cat(cid);
      const jsonString = buffer.toString('utf-8');

      const recordData = JSON.parse(jsonString);

      if (!recordData.userId || !recordData.title || !recordData.uploadedAt) {
        throw new Error('Invalid record format: missing required fields');
      }

      return recordData as IpfsRecord;
    } catch (e) {
      return this.handler.handleError(e, IEM.ERROR_FETCHING_RECORD);
    }
  }

  async deleteRecord(ctx: IDeleteRecordFromIpfs) {
    try {
      const ipfs = this.getIpfsClient();
      const isDeleted = await ipfs.deleteFileByCid(ctx.userId, ctx.cid);

      if (!isDeleted) {
        throw new HttpException(
          'Failed to delete record from ipfs',
          HttpStatus.EXPECTATION_FAILED,
        );
      }

      return isDeleted;
    } catch (e) {
      return this.handler.handleError(e, IEM.ERROR_DELETING_RECORD);
    }
  }

  async findPathFromCid(ctx: IFindPathFromCid) {
    try {
      const ipfs = this.getIpfsClient();
      const filePath = await ipfs.findFileByCid(ctx.userId, ctx.cid);
      return filePath;
    } catch (e) {
      return this.handler.handleError(e, IEM.ERROR_FINDING_PATH);
    }
  }
}
