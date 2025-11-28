import { forwardRef, Module } from '@nestjs/common';
import { AvailabilityProvider } from './provider/availability.provider';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { AvailabilityService } from './service/availability.service';
import { AvailabilityController } from './controller/availability.controller';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [forwardRef(() => AuthModule), forwardRef(() => UserModule)],
  providers: [AvailabilityService, AvailabilityProvider, ErrorHandler],
  controllers: [AvailabilityController],
})
export class AvailabilityModule {}
