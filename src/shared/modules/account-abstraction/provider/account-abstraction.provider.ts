import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ExternalAccountProvider } from '../../external-account/provider/external-account.provider';
import { BiconomyConfig } from '@/shared/config/biconomy/biconomy.config';
import { err } from 'neverthrow';
import { createSmartAccountClient } from '@biconomy/account';
import { CreateSmartAccountError } from '../error/account-abstraction.error';
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

@Injectable()
export class AccountAbstractionProvider {
  private handler: ErrorHandler;
  constructor(
    private readonly eoaProvider: ExternalAccountProvider,
    private readonly biconomyConfig: BiconomyConfig,
    private readonly authUtils: AuthUtils,
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
  ) {
    this.handler = new ErrorHandler();
  }

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

  async createSmartAccount(userId: string) {
    const signerResult = this.eoaProvider.createSigner();
    if (signerResult.isErr()) {
      return err(
        new CreateSmartAccountError(
          `Signer creation failed ${signerResult.error.message}`,
        ),
      );
    }

    const hashedPrivateKey = await this.authUtils.hash(
      signerResult.value.walletData.privateKey,
    );

    const accountConfig = {
      signer: signerResult.value.signer,
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
          externalAddress: signerResult.value.walletData.publicKey,
          privateKey: hashedPrivateKey,
          smartWalletAddress: smartAddress,
          userId: userId,
        })
        .returning();

      const data = {
        userId: account[0].userId,
        smartAddress,
        walletData: signerResult.value.walletData,
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
}
