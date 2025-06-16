import { forwardRef, Module } from '@nestjs/common';
import { UserProvider } from './provider/user.provider';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { AuthUtils } from '@/shared/utils/auth.utils';
import { AccountQueueModule } from '@/shared/queues/account/account-queue.module';
import { TokenModule } from '../token/token.module';
import { AssetModule } from '../asset/asset.module';

@Module({
  imports: [AccountQueueModule, forwardRef(() => TokenModule), AssetModule],
  providers: [UserProvider, UserService, AuthUtils],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
