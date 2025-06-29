import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BiconomyConfig } from '@/shared/config/biconomy/biconomy.config';
import { createSmartAccountClient } from '@biconomy/account';
import {
  LISK_MAINNET_CHAINID,
  LISK_TESTNET_CHAINID,
} from '@/shared/data/constants';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import * as schema from '@/schemas/schema';
import { AuthUtils } from '@/shared/utils/auth.utils';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import {
  AccountAbstractionSuccessMessage as ASM,
  AccountAbstractionErrorMessage as AEM,
} from '../data/account-abstraction.data';
import { ExternalAccountService } from '../../external-account/service/external-account.service';
import { ContractConfig } from '@/shared/config/smart-contract/contract.config';
import { eq } from 'drizzle-orm';

@Injectable()
export class AccountAbstractionProvider {
  constructor(
    private readonly eoaProvider: ExternalAccountService,
    private readonly biconomyConfig: BiconomyConfig,
    private readonly contractConfig: ContractConfig,
    private readonly authUtils: AuthUtils,
    private readonly handler: ErrorHandler,
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
  ) {}

  private provideBundleUrl() {
    if (process.env.NODE_ENV === 'production') {
      return this.biconomyConfig.LISK_MAINNET_BUNDLER_URL;
    } else {
      return this.biconomyConfig.LISK_TESTNET_BUNDLER_URL;
    }
  }

  private provideChainId() {
    if (process.env.NODE_ENV === 'production') {
      return LISK_MAINNET_CHAINID;
    } else {
      return LISK_TESTNET_CHAINID;
    }
  }

  private providerPayMaster() {
    if (process.env.NODE_ENV === 'production') {
      return this.biconomyConfig.LISK_MAINNET_PAYMASTER_API_KEY;
    } else {
      return this.biconomyConfig.LISK_TESTNET_PAYMASTER_API_KEY;
    }
  }

  private async provideAccountConfig(userId: string) {
    const signer = await this.eoaProvider.provideSigner(userId);

    const accountConfig = {
      signer,
      bundlerUrl: this.provideBundleUrl(),
      chainId: this.provideChainId(),
      biconomyPaymasterApiKey: this.providerPayMaster(),
    };

    return accountConfig;
  }

  async createSmartAccount(userId: string) {
    const signerResult = this.eoaProvider.createNewSigner();

    const hashedPrivateKey = this.authUtils.encryptKey({
      data: signerResult.walletData.privateKey,
      key: this.contractConfig.ENCRYPTION_KEY,
    });

    const accountConfig = {
      signer: signerResult.signer,
      bundlerUrl: this.provideBundleUrl(),
      chainId: this.provideChainId(),
      biconomyPaymasterApiKey: this.providerPayMaster(),
    };

    try {
      const client = await createSmartAccountClient(accountConfig);
      if (!client) {
        return this.handler.handleReturn({
          status: HttpStatus.BAD_REQUEST,
          message: AEM.ERROR_CREATING_SMART_ACCOUNT_CLIENT,
          data: null,
        });
      }
      const smartAddress = await client.getAddress();
      const account = await this.db
        .insert(schema.accounts)
        .values({
          externalAddress: signerResult.walletData.walletAddress,
          privateKey: hashedPrivateKey,
          smartWalletAddress: smartAddress,
          userId: userId,
        })
        .returning();

      const data = {
        userId: account[0].userId,
        smartAddress,
        walletData: signerResult.walletData,
      };

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.SMART_ACCOUNT_CREATED,
        data,
      });
    } catch (e) {
      return this.handler.handleError(e, AEM.ERROR_CREATING_SMART_ACCOUNT);
    }
  }

  async getSmartAddress(userId: string) {
    try {
      const result = await this.db.query.accounts.findFirst({
        where: eq(schema.accounts.userId, userId),
      });

      if (!result || !result.smartWalletAddress) {
        return this.handler.handleReturn({
          status: HttpStatus.NOT_FOUND,
          message: AEM.ERROR_SMART_ADDRESS_NOT_FOUND,
        });
      }

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.SMART_ADDRESS_FOUND,
        data: {
          smartAddress: result.smartWalletAddress,
        },
      });
    } catch (e) {
      return this.handler.handleError(e, AEM.ERROR_GETTING_SMART_ADDRESS);
    }
  }

  async provideSmartWallet(userId: string) {
    const accountConfig = await this.provideAccountConfig(userId);
    return await createSmartAccountClient(accountConfig);
  }
}
