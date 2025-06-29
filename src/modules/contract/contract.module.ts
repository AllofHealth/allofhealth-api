import { ExternalAccountModule } from '@/shared/modules/external-account/external-account.module';
import { Module } from '@nestjs/common';
import { ContractService } from './service/contract.service';
import { ContractProvider } from './provider/contract.provider';
import { ErrorHandler } from '@/shared/error-handler/error.handler';

@Module({
  imports: [ExternalAccountModule],
  providers: [ContractService, ContractProvider, ErrorHandler],
})
export class ContractModule {}
