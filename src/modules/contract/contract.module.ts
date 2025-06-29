import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { ExternalAccountModule } from '@/shared/modules/external-account/external-account.module';
import { forwardRef, Module } from '@nestjs/common';
import { ContractController } from './controller/contract.controller';
import { ContractProvider } from './provider/contract.provider';
import { ContractService } from './service/contract.service';
import { AccountAbstractionModule } from '@/shared/modules/account-abstraction/account-abstraction.module';

@Module({
  imports: [ExternalAccountModule, forwardRef(() => AccountAbstractionModule)],
  providers: [ContractService, ContractProvider, ErrorHandler],
  controllers: [ContractController],
})
export class ContractModule {}
