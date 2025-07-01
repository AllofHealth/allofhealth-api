import { Module } from '@nestjs/common';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { AuthUtils } from '@/shared/utils/auth.utils';
import { ExternalAccountModule } from '../external-account/external-account.module';
import { AccountAbstractionController } from './controller/account-abstraction.controller';
import { AccountAbstractionProvider } from './provider/account-abstraction.provider';
import { AccountAbstractionService } from './service/account-abstraction.service';

@Module({
  imports: [ExternalAccountModule],
  providers: [
    AccountAbstractionService,
    AccountAbstractionProvider,
    AuthUtils,
    ErrorHandler,
  ],
  exports: [AccountAbstractionService],
  controllers: [AccountAbstractionController],
})
export class AccountAbstractionModule {}
