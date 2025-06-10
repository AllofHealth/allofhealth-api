import { Module } from '@nestjs/common';
import { AccountAbstractionService } from './service/account-abstraction.service';
import { AccountAbstractionProvider } from './provider/account-abstraction.provider';
import { ExternalAccountModule } from '../external-account/external-account.module';

@Module({
  imports: [ExternalAccountModule],
  providers: [AccountAbstractionService, AccountAbstractionProvider],
  exports: [AccountAbstractionService],
})
export class AccountAbstractionModule {}
