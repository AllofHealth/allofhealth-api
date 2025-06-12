import { Module } from '@nestjs/common';
import { UserProvider } from './provider/user.provider';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';

@Module({
  providers: [UserProvider, UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
