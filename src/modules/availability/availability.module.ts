import { forwardRef, Module } from '@nestjs/common';
import { AvailabilityProvider } from './provider/availability.provider';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { AvailabilityService } from './service/availability.service';
import { AvailabilityController } from './controller/availability.controller';
import { UserModule } from '../user/user.module';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [forwardRef(() => TokenModule), forwardRef(() => UserModule)],
  providers: [AvailabilityService, AvailabilityProvider, ErrorHandler],
  controllers: [AvailabilityController],
})
export class AvailabilityModule {}
