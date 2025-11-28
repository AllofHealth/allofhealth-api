import { Module } from '@nestjs/common';
import { AvailabilityProvider } from './provider/availability.provider';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { AvailabilityService } from './service/availability.service';
import { AvailabilityController } from './controller/availability.controller';

@Module({
  providers: [AvailabilityService, AvailabilityProvider, ErrorHandler],
  controllers: [AvailabilityController],
})
export class AvailabilityModule {}
