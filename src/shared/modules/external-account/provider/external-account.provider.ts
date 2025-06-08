import {
  LISK_MAINNET_RPC_URL,
  LISK_TESTNET_RPC_URL,
} from '@/shared/data/constants';
import { ethers } from 'ethers';
import { HttpStatus, Injectable } from '@nestjs/common';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { IHandleReturn } from '@/shared/interface/shared.interface';
import {
  ExternalAccountErrorMessage,
  ExternalAccountSuccessMessage,
} from '../data/external-account.data';

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

  handleReturn<T, D = undefined, M = undefined>(args: IHandleReturn<T, D, M>) {
    return {
      status: args.status,
      message: args.message,
      data: args.data ? args.data : null,
      meta: args.meta ? args.meta : null,
    };
  }

  getProvider() {
    return new ethers.JsonRpcProvider(this.rpcUrl);
  }

  createWallet() {
    const wallet = ethers.Wallet.createRandom();
    if (!wallet) {
      throw new Error(ExternalAccountErrorMessage.FAILED_TO_CREATE_WALLET);
    }

    return this.handleReturn({
      status: HttpStatus.OK,
      message: ExternalAccountSuccessMessage.WALLET_CREATED,
      data: {
        publicKey: wallet.publicKey,
        privateKey: wallet.privateKey,
        walletAddress: wallet.address,
      },
    });
  }
}
