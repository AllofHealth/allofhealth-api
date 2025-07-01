import { Injectable } from '@nestjs/common';
import type {
  ICreateRefreshToken,
  IFindValidToken,
  IRevokeToken,
} from '../interface/token.interface';
import type { TokenProvider } from '../provider/token.provider';

@Injectable()
export class TokenService {
  constructor(private readonly tokenProvider: TokenProvider) {}

  async saveRefreshToken(args: ICreateRefreshToken) {
    return await this.tokenProvider.createRefreshToken(args);
  }

  async fetchUserToken(userId: string) {
    return await this.tokenProvider.fetchUserToken(userId);
  }

  async findToken(args: IFindValidToken) {
    return await this.tokenProvider.findValidToken(args);
  }

  async revokeToken(args: IRevokeToken) {
    return await this.tokenProvider.revokeToken(args);
  }
}
