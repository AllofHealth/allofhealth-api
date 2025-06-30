import { Injectable } from '@nestjs/common';
import { AssetProvider } from '../provider/asset.provider';
import {
  IUploadIdentityFile,
  IUploadProfilePicture,
} from '../interface/asset.interface';

@Injectable()
export class AssetService {
  constructor(private readonly assetProvider: AssetProvider) {}

  async uploadIdentityAssets(ctx: IUploadIdentityFile) {
    return await this.assetProvider.uploadFile(ctx);
  }

  async uploadProfilePicture(ctx: IUploadProfilePicture) {
    return await this.assetProvider.uploadProfilePicture(ctx);
  }
}
