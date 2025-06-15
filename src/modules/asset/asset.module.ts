import { Module } from '@nestjs/common';
import { AssetService } from './asset/asset.service';
import { Asset } from './asset/asset';
import { AssetService } from './asset.service';
import { Asset } from './asset';
import { AssetController } from './asset.controller';

@Module({
  providers: [AssetService, Asset],
  controllers: [AssetController]
})
export class AssetModule {}
