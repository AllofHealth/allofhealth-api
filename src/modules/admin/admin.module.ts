import { forwardRef, Module } from '@nestjs/common';
import { AdminProvider } from './provider/admin.provider';
import { AdminService } from './service/admin.service';
import { AdminController } from './controller/admin.controller';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { AuthUtils } from '@/shared/utils/auth.utils';
import { TokenModule } from '../token/token.module';
import { AuthModule } from '../auth/auth.module';
import { DoctorModule } from '../doctor/doctor.module';

@Module({
  imports: [
    AuthModule,
    forwardRef(() => TokenModule),
    forwardRef(() => DoctorModule),
  ],
  providers: [AdminProvider, AdminService, ErrorHandler, AuthUtils],
  controllers: [AdminController],
})
export class AdminModule {}
