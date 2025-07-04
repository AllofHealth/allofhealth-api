import { Module } from '@nestjs/common';
import { TokenController } from './controller/token.controller';
import { TokenProvider } from './provider/token.provider';
import { TokenService } from './service/token.service';

@Module({
  providers: [TokenProvider, TokenService],
  controllers: [TokenController],
  exports: [TokenService],
})
export class TokenModule {}
