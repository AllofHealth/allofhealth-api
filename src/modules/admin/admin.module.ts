import { forwardRef, Module } from '@nestjs/common';
import { AdminProvider } from './provider/admin.provider';
import { AdminService } from './service/admin.service';
import { AdminController } from './controller/admin.controller';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { AuthUtils } from '@/shared/utils/auth.utils';
import { TokenModule } from '../token/token.module';
import { AuthModule } from '../auth/auth.module';
import { DoctorModule } from '../doctor/doctor.module';
import { UserModule } from '../user/user.module';
import { AssetModule } from '../asset/asset.module';
import { ApprovalModule } from '../approval/approval.module';

@Module({
  imports: [
    AuthModule,
    forwardRef(() => UserModule),
    forwardRef(() => TokenModule),
    forwardRef(() => DoctorModule),
    forwardRef(() => AssetModule),
    forwardRef(() => ApprovalModule),
  ],
  providers: [AdminProvider, AdminService, ErrorHandler, AuthUtils],
  controllers: [AdminController],
})
export class AdminModule {}
