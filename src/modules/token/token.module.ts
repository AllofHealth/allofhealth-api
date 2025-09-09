import { Module } from '@nestjs/common';
import { TokenController } from './controller/token.controller';
import { TokenProvider } from './provider/token.provider';
import { TokenService } from './service/token.service';
import { ErrorHandler } from '@/shared/error-handler/error.handler';

@Module({
  providers: [TokenProvider, TokenService, ErrorHandler],
  controllers: [TokenController],
  exports: [TokenService],
})
export class TokenModule {}
