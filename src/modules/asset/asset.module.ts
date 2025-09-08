import { Module } from '@nestjs/common';
import { AssetController } from './controller/asset.controller';
import { AssetProvider } from './provider/asset.provider';
import { AssetService } from './service/asset.service';
import { FileCleanupService } from './tasks/file-cleanup.service';
import { ErrorHandler } from '@/shared/error-handler/error.handler';

@Module({
  providers: [AssetService, AssetProvider, FileCleanupService, ErrorHandler],
  controllers: [AssetController],
  exports: [AssetService],
})
export class AssetModule {}
