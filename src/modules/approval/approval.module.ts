import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { AccountAbstractionModule } from '@/shared/modules/account-abstraction/account-abstraction.module';
import { forwardRef, Module } from '@nestjs/common';
import { TokenModule } from '../token/token.module';
import { UserModule } from '../user/user.module';
import { ApprovalController } from './controller/approval.controller';
import { ApprovalProvider } from './provider/approval.provider';
import { ApprovalService } from './service/approval.service';
import { ApprovalCleanupService } from './tasks/approval-cleanup.service';
import { ContractModule } from '../contract/contract.module';

@Module({
  imports: [
    forwardRef(() => AccountAbstractionModule),
    forwardRef(() => TokenModule),
    forwardRef(() => UserModule),
    forwardRef(() => ContractModule),
  ],
  providers: [
    ApprovalService,
    ApprovalProvider,
    ApprovalCleanupService,
    ErrorHandler,
  ],
  controllers: [ApprovalController],
  exports: [ApprovalCleanupService, ApprovalService, ApprovalProvider],
})
export class ApprovalModule {}
