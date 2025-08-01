import { Injectable } from '@nestjs/common';
import { WalletProvider } from '../provider/wallet.provider';

@Injectable()
export class WalletService {
  constructor(private readonly walletProvider: WalletProvider) {}
  async fetchUserWallet(userId: string) {
    return await this.walletProvider.fetchUserWallet(userId);
  }

  async fetchTokenBalance(userId: string) {
    return await this.walletProvider.fetchUserTokenBalance(userId);
  }
}
