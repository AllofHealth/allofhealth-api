import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { ethers } from 'ethers';
import * as schema from '@/schemas/schema';
import type { ContractConfig } from '@/shared/config/smart-contract/contract.config';
import {
  LISK_MAINNET_RPC_URL,
  LISK_TESTNET_RPC_URL,
} from '@/shared/data/constants';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import type { Database } from '@/shared/drizzle/drizzle.types';

import type { ErrorHandler } from '@/shared/error-handler/error.handler';
import type { AuthUtils } from '@/shared/utils/auth.utils';

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
      this.handleGetProvider()
    );
    return {
      signer,
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
          'No signature found for this account',
          HttpStatus.NOT_FOUND
        );
      }

      const decryptedPrivateKey = this.authUtils.decryptKey({
        data: result[0].privateKey,
        key: this.config.ENCRYPTION_KEY,
      });

      const signer = new ethers.Wallet(
        decryptedPrivateKey,
        this.handleGetProvider()
      );
      return signer;
    } catch (e) {
      throw new InternalServerErrorException(
        `An error occurred while providing signer ${e}`
      );
    }
  }

  provideAdminSigner() {
    const signer = new ethers.Wallet(
      this.config.SUPER_PRIVATE_KEY,
      this.handleGetProvider()
    );
    return signer;
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
