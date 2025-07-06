import { forwardRef, Module } from '@nestjs/common';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { AccountAbstractionModule } from '@/shared/modules/account-abstraction/account-abstraction.module';
import { ExternalAccountModule } from '@/shared/modules/external-account/external-account.module';
import { ContractController } from './controller/contract.controller';
import { ContractProvider } from './provider/contract.provider';
import { ContractService } from './service/contract.service';

@Module({
  imports: [ExternalAccountModule, forwardRef(() => AccountAbstractionModule)],
  providers: [ContractService, ContractProvider, ErrorHandler],
  controllers: [ContractController],
  exports: [ContractService],
})
export class ContractModule {}
