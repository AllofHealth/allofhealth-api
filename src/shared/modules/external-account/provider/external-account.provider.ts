import {
  LISK_MAINNET_RPC_URL,
  LISK_TESTNET_RPC_URL,
} from '@/shared/data/constants';
import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class ExternalAccountProvider {
  private readonly rpcUrl: string;
  constructor() {
    this.rpcUrl =
      process.env.NODE_ENV === 'production'
        ? LISK_MAINNET_RPC_URL
        : LISK_TESTNET_RPC_URL;
  }

  handleGetProvider() {
    return new ethers.JsonRpcProvider(this.rpcUrl);
  }

  createSigner() {
    const wallet = this.handleCreateWallet();

    const signer = new ethers.Wallet(
      wallet.privateKey,
      this.handleGetProvider(),
    );
    return {
      signer: signer,
      walletData: {
        publicKey: wallet.publicKey,
        privateKey: wallet.privateKey,
        walletAddress: wallet.walletAddress,
      },
    };
  }

  handleCreateWallet() {
    const wallet = ethers.Wallet.createRandom();

    return {
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey,
      walletAddress: wallet.address,
    };
  }
}
