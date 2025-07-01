import { forwardRef, Module } from '@nestjs/common';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { AccountQueueModule } from '@/shared/queues/account/account-queue.module';
import { AuthUtils } from '@/shared/utils/auth.utils';
import { AssetModule } from '../asset/asset.module';
import { TokenModule } from '../token/token.module';
import { UserController } from './controller/user.controller';
import { UserProvider } from './provider/user.provider';
import { UserService } from './service/user.service';

@Module({
  imports: [AccountQueueModule, forwardRef(() => TokenModule), AssetModule],
  providers: [UserProvider, UserService, AuthUtils, ErrorHandler],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
