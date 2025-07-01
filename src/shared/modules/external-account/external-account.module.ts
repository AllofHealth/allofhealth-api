import { Module } from '@nestjs/common';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { AuthUtils } from '@/shared/utils/auth.utils';
import { ExternalAccountProvider } from './provider/external-account.provider';
import { ExternalAccountService } from './service/external-account.service';

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
