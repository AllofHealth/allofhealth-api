import { Module } from '@nestjs/common';
import { Token } from './token';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';

@Module({
  providers: [Token, TokenService],
  controllers: [TokenController]
})
export class TokenModule {}
