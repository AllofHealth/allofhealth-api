import {
  LISK_MAINNET_RPC_URL,
  LISK_TESTNET_RPC_URL,
} from '@/shared/data/constants';
import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { err, fromThrowable, ok } from 'neverthrow';
import { ExternalAccountErrorMessage } from '../data/external-account.data';
import {
  ProviderError,
  WalletCreationError,
} from '../errors/external-account.errors';
import {
  TProviderResult,
  TWalletResult,
} from '../interface/external-account.interface';

@Injectable()
export class ExternalAccountProvider {
  private readonly rpcUrl: string;
  constructor() {
    this.rpcUrl =
      process.env.NODE_ENV === 'production'
        ? LISK_MAINNET_RPC_URL
        : LISK_TESTNET_RPC_URL;
  }

  handleGetProvider(): TProviderResult {
    if (!this.rpcUrl) {
      return err(
        new ProviderError(ExternalAccountErrorMessage.INVALID_RPC_URL),
      );
    }

    const createProvider = fromThrowable(
      (url: string) => new ethers.JsonRpcProvider(url),
      (error: Error) =>
        new ProviderError(`Failed to create provider: ${error}`),
    );

    return createProvider(this.rpcUrl);
  }

  handleCreateWallet(): TWalletResult {
    const createRandonWallet = fromThrowable(
      () => ethers.Wallet.createRandom(),
      (error: Error) =>
        new WalletCreationError(`Failed to create wallet: ${error}`),
    );

    return createRandonWallet().andThen((wallet) => {
      if (!wallet) {
        return err(
          new WalletCreationError(
            ExternalAccountErrorMessage.FAILED_TO_CREATE_WALLET,
          ),
        );
      }

      return ok({
        publicKey: wallet.publicKey,
        privateKey: wallet.privateKey,
        walletAddress: wallet.address,
      });
    });
  }
}
