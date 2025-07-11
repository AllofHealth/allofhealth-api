import { Module } from '@nestjs/common';
import { AdminProvider } from './provider/admin.provider';
import { AdminService } from './service/admin.service';
import { AdminController } from './controller/admin.controller';
import { ErrorHandler } from '@/shared/error-handler/error.handler';

@Module({
  providers: [AdminProvider, AdminService, ErrorHandler],
  controllers: [AdminController],
})
export class AdminModule {}
