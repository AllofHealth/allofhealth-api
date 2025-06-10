import { Injectable } from '@nestjs/common';
import { ExternalAccountProvider } from '../../external-account/provider/external-account.provider';
import { BiconomyConfig } from '@/shared/config/biconomy/biconomy.config';
import { err, ResultAsync } from 'neverthrow';
import { createSmartAccountClient } from '@biconomy/account';
import { CreateSmartAccountError } from '../error/account-abstraction.error';

@Injectable()
export class AccountAbstractionProvider {
  constructor(
    private readonly eoaProvider: ExternalAccountProvider,
    private readonly biconomyConfig: BiconomyConfig,
  ) {}

  private provideBundleUrl() {
    if (process.env.NODE_ENV === 'production') {
      return this.biconomyConfig.LISK_MAINNET_BUNDLER_URL;
    } else {
      return this.biconomyConfig.LISK_TESTNET_BUNDLER_URL;
    }
  }

  private providerPayMaster() {
    if (process.env.NODE_ENV === 'production') {
      return this.biconomyConfig.LISK_MAINNET_PAYMASTER_API_KEY;
    } else {
      return this.biconomyConfig.LISK_TESTNET_PAYMASTER_API_KEY;
    }
  }

  async createSmartAccount() {
    const signerResult = this.eoaProvider.createSigner();
    if (signerResult.isErr()) {
      return err(
        new CreateSmartAccountError(
          `Signer creation failed ${signerResult.error.message}`,
        ),
      );
    }

    const accountConfig = {
      signer: signerResult.value.signer,
      bundlerUrl: this.provideBundleUrl(),
      paymasterUrl: this.providerPayMaster(),
    };

    return await ResultAsync.fromPromise(
      createSmartAccountClient(accountConfig),
      (error: Error) =>
        new CreateSmartAccountError(
          `Smart account creation failed ${error.message}`,
        ),
    )
      .andThen((client) =>
        ResultAsync.fromPromise(
          client.getAddress(),
          (error: Error) =>
            new CreateSmartAccountError(
              `Error fetching smart account address ${error}`,
            ),
        ),
      )
      .map((address) => ({
        smartAddress: address,
        walletData: signerResult.value.walletData,
      }));
  }
}
