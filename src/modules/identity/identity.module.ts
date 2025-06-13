import { Module } from '@nestjs/common';
import { IdentityService } from './service/identity.service';
import { IdentityProvider } from './provider/identity.provider';
import { IdentityController } from './controller/identity.controller';

@Module({
  providers: [IdentityService, IdentityProvider],
  controllers: [IdentityController],
})
export class IdentityModule {}
