import { Module } from '@nestjs/common';
import { AccountAbstractionService } from './service/account-abstraction.service';
import { AccountAbstractionProvider } from './provider/account-abstraction.provider';

@Module({
  providers: [AccountAbstractionService, AccountAbstractionProvider],
  exports: [AccountAbstractionService],
})
export class AccountAbstractionModule {}
