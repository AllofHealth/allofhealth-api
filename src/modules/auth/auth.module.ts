import { Module } from '@nestjs/common';
import { AuthProvider } from './provider/auth.provider';
import { AuthService } from './service/auth.service';
import { TokenModule } from '../token/token.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule, TokenModule],
  providers: [AuthProvider, AuthService],
})
export class AuthModule {}
