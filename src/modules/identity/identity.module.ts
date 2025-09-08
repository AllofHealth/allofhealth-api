import { Module } from '@nestjs/common';
import { IdentityController } from './controller/identity.controller';
import { IdentityProvider } from './provider/identity.provider';
import { IdentityService } from './service/identity.service';
import { ErrorHandler } from '@/shared/error-handler/error.handler';

@Module({
  providers: [IdentityService, IdentityProvider, ErrorHandler],
  controllers: [IdentityController],
})
export class IdentityModule {}
