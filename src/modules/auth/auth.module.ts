import { Module } from '@nestjs/common';
import { AuthUtils } from '@/shared/utils/auth.utils';
import { TokenModule } from '../token/token.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './controller/auth.controller';
import { AuthProvider } from './provider/auth.provider';
import { AuthService } from './service/auth.service';
import { ErrorHandler } from '@/shared/error-handler/error.handler';

@Module({
  imports: [UserModule, TokenModule],
  providers: [AuthProvider, AuthService, AuthUtils, ErrorHandler],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
