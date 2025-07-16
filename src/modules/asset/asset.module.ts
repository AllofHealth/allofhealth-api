import { Module } from '@nestjs/common';
import { AssetController } from './controller/asset.controller';
import { AssetProvider } from './provider/asset.provider';
import { AssetService } from './service/asset.service';
import { FileCleanupService } from './tasks/file-cleanup.service';

@Module({
  providers: [AssetService, AssetProvider, FileCleanupService],
  controllers: [AssetController],
  exports: [AssetService],
})
export class AssetModule {}
