import {
  LISK_MAINNET_RPC_URL,
  LISK_TESTNET_RPC_URL,
} from '@/shared/data/constants';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as schema from '@/schemas/schema';
import { eq } from 'drizzle-orm';
import { AuthUtils } from '@/shared/utils/auth.utils';

import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { ExternalAccountErrorMessage } from '../data/external-account.data';
import { ContractConfig } from '@/shared/config/smart-contract/contract.config';

@Injectable()
export class ExternalAccountProvider {
  private readonly rpcUrl: string;
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
    private readonly authUtils: AuthUtils,
    private readonly config: ContractConfig,
    private readonly handlerService: ErrorHandler,
  ) {
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

  async provideSigner(userId: string) {
    try {
      const result = await this.db
        .select({
          privateKey: schema.accounts.privateKey,
        })
        .from(schema.accounts)
        .where(eq(schema.accounts.userId, userId));

      if (
        !result ||
        result.length === 0 ||
        !result[0].privateKey ||
        result[0].privateKey === null
      ) {
        throw new HttpException(
          `No signature found for this account`,
          HttpStatus.NOT_FOUND,
        );
      }

      const decryptedPrivateKey = this.authUtils.decryptKey({
        data: result[0].privateKey,
        key: this.config.ENCRYPTION_KEY,
      });

      const signer = new ethers.Wallet(
        decryptedPrivateKey,
        this.handleGetProvider(),
      );
      return signer;
    } catch (e) {
      return this.handlerService.handleError(
        e,
        ExternalAccountErrorMessage.ERROR_PROVIDING_SIGNER,
      );
    }
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
