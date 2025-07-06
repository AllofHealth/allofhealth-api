import { forwardRef, Module } from '@nestjs/common';
import { ApprovalService } from './service/approval.service';
import { ApprovalProvider } from './provider/approval.provider';
import { ApprovalController } from './controller/approval.controller';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { AccountAbstractionModule } from '@/shared/modules/account-abstraction/account-abstraction.module';
import { ContractModule } from '../contract/contract.module';

@Module({
  imports: [
    forwardRef(() => AccountAbstractionModule),
    forwardRef(() => ContractModule),
  ],
  providers: [ApprovalService, ApprovalProvider, ErrorHandler],
  controllers: [ApprovalController],
})
export class ApprovalModule {}
