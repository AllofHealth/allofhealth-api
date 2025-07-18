import { forwardRef, Module } from '@nestjs/common';
import { HealthInfoProvider } from './provider/health-info.provider';
import { HealthInfoService } from './service/health-info.service';
import { HealthInfoController } from './controller/health-info.controller';
import { UserModule } from '../user/user.module';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [forwardRef(() => UserModule), forwardRef(() => TokenModule)],
  providers: [HealthInfoProvider, HealthInfoService],
  controllers: [HealthInfoController],
  exports: [HealthInfoService],
})
export class HealthInfoModule {}
