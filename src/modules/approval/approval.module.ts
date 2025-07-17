import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { AccountAbstractionModule } from '@/shared/modules/account-abstraction/account-abstraction.module';
import { forwardRef, Module } from '@nestjs/common';
import { ContractModule } from '../contract/contract.module';
import { TokenModule } from '../token/token.module';
import { UserModule } from '../user/user.module';
import { ApprovalController } from './controller/approval.controller';
import { ApprovalProvider } from './provider/approval.provider';
import { ApprovalService } from './service/approval.service';
import { ApprovalCleanupService } from './tasks/approval-cleanup.service';

@Module({
  imports: [
    forwardRef(() => AccountAbstractionModule),
    forwardRef(() => ContractModule),
    forwardRef(() => TokenModule),
    forwardRef(() => UserModule),
  ],
  providers: [
    ApprovalService,
    ApprovalProvider,
    ApprovalCleanupService,
    ErrorHandler,
  ],
  controllers: [ApprovalController],
  exports: [ApprovalCleanupService, ApprovalService],
})
export class ApprovalModule {}
