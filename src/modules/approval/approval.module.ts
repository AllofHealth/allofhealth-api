import { forwardRef, Module } from '@nestjs/common';
import { ApprovalService } from './service/approval.service';
import { ApprovalProvider } from './provider/approval.provider';
import { ApprovalController } from './controller/approval.controller';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { AccountAbstractionModule } from '@/shared/modules/account-abstraction/account-abstraction.module';
import { ContractModule } from '../contract/contract.module';
import { TokenModule } from '../token/token.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    forwardRef(() => AccountAbstractionModule),
    forwardRef(() => ContractModule),
    forwardRef(() => TokenModule),
    forwardRef(() => UserModule),
  ],
  providers: [ApprovalService, ApprovalProvider, ErrorHandler],
  controllers: [ApprovalController],
})
export class ApprovalModule {}
