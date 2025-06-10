import {
  LISK_MAINNET_RPC_URL,
  LISK_TESTNET_RPC_URL,
} from '@/shared/data/constants';
import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { err, fromThrowable, ok, Result } from 'neverthrow';
import { ExternalAccountErrorMessage } from '../data/external-account.data';
import {
  CreateSignerError,
  ProviderError,
  WalletCreationError,
} from '../errors/external-account.errors';
import {
  TCreateSignerResult,
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

  createSigner(): TCreateSignerResult {
    return this.handleCreateWallet().andThen((walletData) =>
      this.handleGetProvider().andThen((provider) => {
        const signerResult = Result.fromThrowable(
          () => new ethers.Wallet(walletData.privateKey, provider),
          (error: Error) =>
            new CreateSignerError(`Failed to create signer: ${error}`),
        )();

        return signerResult.map((signer) => ({
          signer,
          walletData,
        }));
      }),
    );
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
