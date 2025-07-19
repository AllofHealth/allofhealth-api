import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as fs from 'fs';
import ImageKit from 'imagekit';
import { ImageKitConfig } from '@/shared/config/imagekit/imagekit.config';
import { StoreId } from '@/shared/dtos/event.dto';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { SharedEvents } from '@/shared/events/shared.events';
import {
  AssetErrorMessage as AEM,
  AssetSuccessMessage as ASM,
} from '../data/asset.data';
import { AssetError } from '../error/asset.error';
import {
  IHandleImageKitUpload,
  IUploadIdentityFile,
  IUploadProfilePicture,
  TUploadContext,
} from '../interface/asset.interface';

@Injectable()
export class AssetProvider {
  private handler: ErrorHandler;
  constructor(
    private readonly imageKitConfig: ImageKitConfig,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.handler = new ErrorHandler();
  }

  private initImageKit() {
    //eslint-disable-next-line
    const ImageKit = require('imagekit');

    const imageKit = new ImageKit({
      publicKey: this.imageKitConfig.IMAGE_KIT_PUBLIC_KEY,
      privateKey: this.imageKitConfig.IMAGE_KIT_PRIVATE_KEY,
      urlEndpoint: this.imageKitConfig.IMAGE_KIT_URL_ENDPOINT,
    });

    return imageKit as ImageKit;
  }

  private authenticateImageKit() {
    const imageKit = this.initImageKit();
    const result = imageKit.getAuthenticationParameters();

    return {
      token: result.token,
      expire: result.expire,
      signature: result.signature,
    };
  }

  private generateUrl(filePath: string) {
    const imageKit = this.initImageKit();
    const imageUrl = imageKit.url({
      path: filePath,
      urlEndpoint: this.imageKitConfig.IMAGE_KIT_URL_ENDPOINT,
    });

    return imageUrl;
  }

  async folderExists(folderPath: string) {
    const imageKit = this.initImageKit();
    try {
      const normalizedPath = folderPath.startsWith('/')
        ? folderPath.substring(1)
        : folderPath;
      const parentPath = normalizedPath.includes('/')
        ? normalizedPath.substring(0, normalizedPath.lastIndexOf('/'))
        : '';

      const folderName = normalizedPath.includes('/')
        ? normalizedPath.substring(normalizedPath.lastIndexOf('/') + 1)
        : normalizedPath;

      const folders = await imageKit.listFiles({
        path: parentPath,
        type: 'folder',
      });

      return folders.some((folder) => folder.name === folderName);
    } catch (e) {
      return this.handler.handleError(e, AEM.ERROR_VALIDATING_FOLDER);
    }
  }

  private async createFolder(userId: string) {
    const folderPath = `/${userId}`;
    const imageKit = this.initImageKit();

    try {
      const exists = await this.folderExists(folderPath);

      if (exists) {
        return {
          status: HttpStatus.CREATED,
        };
      }

      await imageKit.createFolder({
        folderName: userId,
        parentFolderPath: '/',
      });

      return {
        status: HttpStatus.OK,
      };
    } catch (e) {
      return this.handler.handleError(e, AEM.ERROR_CREATING_FOLDER);
    }
  }

  private async handleImageKitUpload(ctx: IHandleImageKitUpload) {
    const imageKit = this.initImageKit();
    try {
      const response = await imageKit.upload({
        file: ctx.fileBuffer,
        folder: ctx.folderPath,
        fileName: `${ctx.uploadContext}-${ctx.userId}`,
        useUniqueFileName: true,
      });

      return {
        fileId: response.fileId,
        url: response.url,
      };
    } catch (e) {
      throw new AssetError(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async cleanupLocalFiles(filePaths: string[]): Promise<void> {
    const cleanupPromises = filePaths.map(async (filePath) => {
      try {
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
        }
      } catch (error) {
        console.warn(`Failed to cleanup file ${filePath}:`, error);
      }
    });

    await Promise.all(cleanupPromises);
  }

  async uploadProfilePicture(ctx: IUploadProfilePicture) {
    const {
      userId,
      profilePictureFilePath,
      context = TUploadContext.PROFILE_PICTURE,
    } = ctx;
    const folderPath = `/${userId}`;
    const filesToCleanup: string[] = [];
    try {
      const result = await this.createFolder(userId);
      if (!result) {
        throw new BadRequestException(AEM.ERROR_CREATING_FOLDER);
      }
      if (result.status === HttpStatus.INTERNAL_SERVER_ERROR) {
        return this.handler.handleReturn({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: AEM.ERROR_CREATING_FOLDER,
        });
      }

      filesToCleanup.push(profilePictureFilePath);
      const profilePictureBuffer = fs.readFileSync(profilePictureFilePath);
      const response = await this.handleImageKitUpload({
        userId,
        fileBuffer: profilePictureBuffer,
        folderPath,
        uploadContext: context,
      });

      await this.cleanupLocalFiles(filesToCleanup);

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.FILE_UPLOADED,
        data: {
          url: response.url,
          fileId: response.fileId,
        },
      });
    } catch (e) {
      return this.handler.handleError(e, AEM.ERROR_UPLOADING_FILE);
    }
  }

  async uploadFile(ctx: IUploadIdentityFile) {
    const folderPath = `/${ctx.userId}`;
    const filesToCleanup: string[] = [];

    try {
      const { token } = this.authenticateImageKit();

      if (!token) {
        return this.handler.handleReturn({
          status: HttpStatus.UNAUTHORIZED,
          message: AEM.UNAUTHORIZED,
        });
      }

      const result = await this.createFolder(ctx.userId);
      if (!result) {
        throw new BadRequestException(AEM.ERROR_CREATING_FOLDER);
      }
      if (result.status === HttpStatus.INTERNAL_SERVER_ERROR) {
        return this.handler.handleReturn({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: AEM.ERROR_CREATING_FOLDER,
        });
      }

      let uploadPromises: Promise<any>[] = [];
      let eventData: StoreId;

      if (ctx.role === 'PATIENT') {
        filesToCleanup.push(ctx.governmentIdFilePath!);

        const governmentFileBuffer = fs.readFileSync(ctx.governmentIdFilePath!);
        uploadPromises.push(
          this.handleImageKitUpload({
            userId: ctx.userId,
            fileBuffer: governmentFileBuffer,
            folderPath,
            uploadContext: TUploadContext.GOVERNMENT_ID,
          }),
        );

        const [response] = await Promise.all(uploadPromises);

        eventData = new StoreId(
          ctx.userId,
          'PATIENT',
          response.url,
          response.fileId,
        );
      } else if (ctx.role === 'DOCTOR') {
        filesToCleanup.push(
          ctx.governmentIdFilePath!,
          ctx.scannedLicenseFilePath!,
        );

        const governmentFileBuffer = fs.readFileSync(ctx.governmentIdFilePath!);
        const scannedLicenseBuffer = fs.readFileSync(
          ctx.scannedLicenseFilePath!,
        );

        uploadPromises = [
          this.handleImageKitUpload({
            userId: ctx.userId,
            fileBuffer: governmentFileBuffer,
            folderPath,
            uploadContext: TUploadContext.GOVERNMENT_ID,
          }),
          this.handleImageKitUpload({
            userId: ctx.userId,
            fileBuffer: scannedLicenseBuffer,
            folderPath,
            uploadContext: TUploadContext.SCANNED,
          }),
        ];

        const [governmentResponse, licenseResponse] =
          await Promise.all(uploadPromises);

        eventData = new StoreId(
          ctx.userId,
          'DOCTOR',
          governmentResponse.url,
          governmentResponse.fileId,
          licenseResponse.url,
          licenseResponse.fileId,
        );
      }

      this.eventEmitter.emit(SharedEvents.STORE_IDENTIFICATION, eventData!);
      await this.cleanupLocalFiles(filesToCleanup);

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.FILE_UPLOADED,
      });
    } catch (e) {
      await this.cleanupLocalFiles(filesToCleanup);
      return this.handler.handleError(e, AEM.ERROR_UPLOADING_FILE);
    }
  }
}
