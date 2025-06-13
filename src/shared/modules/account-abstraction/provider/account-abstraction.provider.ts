import { Inject, Injectable } from '@nestjs/common';
import { ExternalAccountProvider } from '../../external-account/provider/external-account.provider';
import { BiconomyConfig } from '@/shared/config/biconomy/biconomy.config';
import { err, ResultAsync } from 'neverthrow';
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

@Injectable()
export class AccountAbstractionProvider {
  constructor(
    private readonly eoaProvider: ExternalAccountProvider,
    private readonly biconomyConfig: BiconomyConfig,
    private readonly authUtils: AuthUtils,
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

    ResultAsync.fromPromise(
      createSmartAccountClient(accountConfig),
      (error: Error) =>
        new CreateSmartAccountError(
          `Smart account creation failed ${error.message}`,
        ),
    ).andThen((client) =>
      ResultAsync.fromPromise(
        client.getAccountAddress(),
        (error: Error) =>
          new CreateSmartAccountError(
            `Error fetching smart account address ${error}`,
          ),
      ).andThen((address) => {
        return ResultAsync.fromPromise(
          this.db
            .insert(schema.accounts)
            .values({
              externalAddress: signerResult.value.walletData.publicKey,
              privateKey: hashedPrivateKey,
              smartWalletAddress: address,
              userId: userId,
            })
            .returning(),
          (error: Error) => {
            return new CreateSmartAccountError(
              `Error inserting account data ${error.message}`,
            );
          },
        ).map((account) => ({
          userId: account[0].userId,
          smartAddress: address,
          walletData: signerResult.value.walletData,
        }));
      }),
    );
  }
}
