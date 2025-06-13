import { Module } from '@nestjs/common';
import { AccountAbstractionService } from './service/account-abstraction.service';
import { AccountAbstractionProvider } from './provider/account-abstraction.provider';
import { ExternalAccountModule } from '../external-account/external-account.module';
import { AuthUtils } from '@/shared/utils/auth.utils';

@Module({
  imports: [ExternalAccountModule],
  providers: [AccountAbstractionService, AccountAbstractionProvider, AuthUtils],
  exports: [AccountAbstractionService],
})
export class AccountAbstractionModule {}
