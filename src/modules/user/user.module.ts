import { Module } from '@nestjs/common';
import { UserProvider } from './provider/user.provider';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { AuthUtils } from '@/shared/utils/auth.utils';

@Module({
  providers: [UserProvider, UserService, AuthUtils],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
