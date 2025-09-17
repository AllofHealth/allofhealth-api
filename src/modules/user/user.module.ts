import { forwardRef, Module } from '@nestjs/common';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { AccountQueueModule } from '@/shared/queues/account/account-queue.module';
import { AuthUtils } from '@/shared/utils/auth.utils';
import { AssetModule } from '../asset/asset.module';
import { TokenModule } from '../token/token.module';
import { UserController } from './controller/user.controller';
import { UserProvider } from './provider/user.provider';
import { UserService } from './service/user.service';
import { WalletModule } from '../wallet/wallet.module';
import { ApprovalModule } from '../approval/approval.module';
import { ContractModule } from '../contract/contract.module';
import { OtpModule } from '../otp/otp.module';
import { ResendModule } from '@/shared/modules/resend/resend.module';
import { AdminModule } from '../admin/admin.module';
import { AccountAbstractionModule } from '@/shared/modules/account-abstraction/account-abstraction.module';

@Module({
  imports: [
    AccountQueueModule,
    forwardRef(() => TokenModule),
    AssetModule,
    forwardRef(() => WalletModule),
    forwardRef(() => ApprovalModule),
    forwardRef(() => ContractModule),
    forwardRef(() => OtpModule),
    forwardRef(() => ResendModule),
    forwardRef(() => AdminModule),
    forwardRef(() => AccountAbstractionModule),
  ],
  providers: [UserProvider, UserService, AuthUtils, ErrorHandler],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
