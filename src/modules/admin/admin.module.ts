import { Module } from '@nestjs/common';
import { AdminProvider } from './provider/admin.provider';
import { AdminService } from './service/admin.service';
import { AdminController } from './controller/admin.controller';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { AuthUtils } from '@/shared/utils/auth.utils';

@Module({
  providers: [AdminProvider, AdminService, ErrorHandler, AuthUtils],
  controllers: [AdminController],
})
export class AdminModule {}
