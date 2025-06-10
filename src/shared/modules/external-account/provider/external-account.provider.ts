import {
  LISK_MAINNET_RPC_URL,
  LISK_TESTNET_RPC_URL,
} from '@/shared/data/constants';
import { ethers } from 'ethers';
import { HttpStatus, Injectable } from '@nestjs/common';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { IHandleReturn } from '@/shared/interface/shared.interface';
import { ExternalAccountErrorMessage } from '../data/external-account.data';
import { Result, ok, err, fromThrowable } from 'neverthrow';
import {
  TProviderResult,
  TWalletResult,
} from '../interface/external-account.interface';
import {
  ProviderError,
  WalletCreationError,
} from '../errors/external-account.errors';

@Injectable()
export class ExternalAccountProvider {
  private readonly logger = new MyLoggerService(ExternalAccountProvider.name);
  private readonly rpcUrl: string;
  constructor() {
    this.rpcUrl =
      process.env.NODE_ENV === 'production'
        ? LISK_MAINNET_RPC_URL
        : LISK_TESTNET_RPC_URL;
  }

  handleResult<T, E extends Error>(
    result: Result<T, E>,
    successMessage: string,
  ) {
    return result.match(
      (data) =>
        this.handleReturn({
          status: HttpStatus.OK,
          message: successMessage,
          data,
        }),
      (error) => this.handleError(error, error.message),
    );
  }

  handleError(error: any, context: string) {
    console.error(error, context);
    this.logger.error(`${context}: ${error.message}`);
    if (error.status) {
      return {
        //eslint-disable-next-line
        status: error.status,
        //eslint-disable-next-line
        message: error.message || context,
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: context,
      //eslint-disable-next-line
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined,
    };
  }

  private handleReturn<T, D = undefined, M = undefined>(
    args: IHandleReturn<T, D, M>,
  ) {
    return {
      status: args.status,
      message: args.message,
      data: args.data ? args.data : null,
      meta: args.meta ? args.meta : null,
    };
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
