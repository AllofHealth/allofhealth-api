import { Module } from '@nestjs/common';
import { IdentityController } from './controller/identity.controller';
import { IdentityProvider } from './provider/identity.provider';
import { IdentityService } from './service/identity.service';

@Module({
  providers: [IdentityService, IdentityProvider],
  controllers: [IdentityController],
})
export class IdentityModule {}
