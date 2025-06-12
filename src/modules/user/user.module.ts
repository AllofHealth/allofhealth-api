import { Module } from '@nestjs/common';
import { User } from './user';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  providers: [User, UserService],
  controllers: [UserController]
})
export class UserModule {}
