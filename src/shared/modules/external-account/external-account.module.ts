import { Module } from '@nestjs/common';
import { ExternalAccountService } from './service/external-account.service';
import { ExternalAccountProvider } from './provider/external-account.provider';
import { AuthUtils } from '@/shared/utils/auth.utils';
import { ErrorHandler } from '@/shared/error-handler/error.handler';

@Module({
  providers: [
    ExternalAccountService,
    ExternalAccountProvider,
    AuthUtils,
    ErrorHandler,
  ],
  exports: [ExternalAccountService],
})
export class ExternalAccountModule {}
