import { forwardRef, Module } from '@nestjs/common';
import { HealthInfoProvider } from './provider/health-info.provider';
import { HealthInfoService } from './service/health-info.service';
import { HealthInfoController } from './controller/health-info.controller';
import { UserModule } from '../user/user.module';
import { TokenModule } from '../token/token.module';
import { ApprovalModule } from '../approval/approval.module';
import { ErrorHandler } from '@/shared/error-handler/error.handler';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => TokenModule),
    forwardRef(() => ApprovalModule),
  ],
  providers: [HealthInfoProvider, HealthInfoService, ErrorHandler],
  controllers: [HealthInfoController],
  exports: [HealthInfoService],
})
export class HealthInfoModule {}
