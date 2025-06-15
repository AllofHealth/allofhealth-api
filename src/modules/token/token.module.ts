import { Module } from '@nestjs/common';
import { TokenProvider } from './provider/token.provider';
import { TokenService } from './service/token.service';
import { TokenController } from './controller/token.controller';

@Module({
  providers: [TokenProvider, TokenService],
  controllers: [TokenController],
  exports: [TokenService],
})
export class TokenModule {}
