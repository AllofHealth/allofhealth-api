import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { ExternalAccountModule } from '@/shared/modules/external-account/external-account.module';
import { Module } from '@nestjs/common';
import { ContractController } from './controller/contract.controller';
import { ContractProvider } from './provider/contract.provider';
import { ContractService } from './service/contract.service';

@Module({
  imports: [ExternalAccountModule],
  providers: [ContractService, ContractProvider, ErrorHandler],
  controllers: [ContractController],
})
export class ContractModule {}
