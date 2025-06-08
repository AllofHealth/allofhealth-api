import { Module } from '@nestjs/common';
import { ExternalAccountService } from './service/external-account.service';
import { ExternalAccountProvider } from './provider/external-account.provider';

@Module({
  providers: [ExternalAccountService, ExternalAccountProvider],
})
export class ExternalAccountModule {}
