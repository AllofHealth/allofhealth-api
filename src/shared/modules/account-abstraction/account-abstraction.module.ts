import { Module } from '@nestjs/common';
import { AccountAbstractionService } from './service/account-abstraction.service';
import { AccountAbstractionProvider } from './provider/account-abstraction.provider';
import { ExternalAccountModule } from '../external-account/external-account.module';
import { AuthUtils } from '@/shared/utils/auth.utils';
import { AccountAbstractionController } from './controller/account-abstraction.controller';

@Module({
  imports: [ExternalAccountModule],
  providers: [AccountAbstractionService, AccountAbstractionProvider, AuthUtils],
  exports: [AccountAbstractionService],
  controllers: [AccountAbstractionController],
})
export class AccountAbstractionModule {}
