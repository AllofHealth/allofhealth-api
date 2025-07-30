import { forwardRef, Module } from '@nestjs/common';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { AccountAbstractionModule } from '@/shared/modules/account-abstraction/account-abstraction.module';
import { ExternalAccountModule } from '@/shared/modules/external-account/external-account.module';
import { ContractController } from './controller/contract.controller';
import { ContractProvider } from './provider/contract.provider';
import { ContractService } from './service/contract.service';
import { RewardModule } from '../reward/reward.module';

@Module({
  imports: [
    ExternalAccountModule,
    forwardRef(() => AccountAbstractionModule),
    forwardRef(() => RewardModule),
  ],
  providers: [ContractService, ContractProvider, ErrorHandler],
  controllers: [ContractController],
  exports: [ContractService, ContractProvider],
})
export class ContractModule { }
