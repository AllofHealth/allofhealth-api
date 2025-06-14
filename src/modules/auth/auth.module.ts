import { Module } from '@nestjs/common';
import { Auth } from './auth';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  providers: [Auth, AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
