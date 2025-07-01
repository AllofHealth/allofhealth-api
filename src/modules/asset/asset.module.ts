import { Module } from '@nestjs/common';
import { AssetController } from './controller/asset.controller';
import { AssetProvider } from './provider/asset.provider';
import { AssetService } from './service/asset.service';

@Module({
  providers: [AssetService, AssetProvider],
  controllers: [AssetController],
  exports: [AssetService],
})
export class AssetModule {}
