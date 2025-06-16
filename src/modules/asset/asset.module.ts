import { Module } from '@nestjs/common';
import { AssetProvider } from './provider/asset.provider';
import { AssetService } from './service/asset.service';
import { AssetController } from './controller/asset.controller';

@Module({
  providers: [AssetService, AssetProvider],
  controllers: [AssetController],
  exports: [AssetService],
})
export class AssetModule {}
