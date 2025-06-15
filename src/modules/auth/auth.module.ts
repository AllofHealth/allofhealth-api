import { AuthUtils } from '@/shared/utils/auth.utils';
import { Module } from '@nestjs/common';
import { TokenModule } from '../token/token.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './controller/auth.controller';
import { AuthProvider } from './provider/auth.provider';
import { AuthService } from './service/auth.service';

@Module({
  imports: [UserModule, TokenModule],
  providers: [AuthProvider, AuthService, AuthUtils],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
