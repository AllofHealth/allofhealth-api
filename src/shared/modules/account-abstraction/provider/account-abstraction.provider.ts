import { createSmartAccountClient } from '@biconomy/account';
import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as schema from '@/schemas/schema';
import { BiconomyConfig } from '@/shared/config/biconomy/biconomy.config';
import { ContractConfig } from '@/shared/config/smart-contract/contract.config';
import {
  LISK_MAINNET_CHAINID,
  LISK_TESTNET_CHAINID,
} from '@/shared/data/constants';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { AuthUtils } from '@/shared/utils/auth.utils';
import { ExternalAccountService } from '../../external-account/service/external-account.service';
import {
  AccountAbstractionErrorMessage as AEM,
  AccountAbstractionSuccessMessage as ASM,
} from '../data/account-abstraction.data';

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
    }
    return this.biconomyConfig.LISK_TESTNET_BUNDLER_URL;
  }

  private provideChainId() {
    if (process.env.NODE_ENV === 'production') {
      return LISK_MAINNET_CHAINID;
    }
    return LISK_TESTNET_CHAINID;
  }

  private providerPayMaster() {
    if (process.env.NODE_ENV === 'production') {
      return this.biconomyConfig.LISK_MAINNET_PAYMASTER_API_KEY;
    }
    return this.biconomyConfig.LISK_TESTNET_PAYMASTER_API_KEY;
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

  async createSmartAccount(userId: string, rpc?: string) {
    const signerResult = this.eoaProvider.createNewSigner(rpc);

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
        throw new BadRequestException(AEM.ERROR_CREATING_SMART_ACCOUNT_CLIENT);
      }
      const smartAddress = await client.getAddress();
      const account = await this.db
        .insert(schema.accounts)
        .values({
          externalAddress: signerResult.walletData.walletAddress,
          privateKey: hashedPrivateKey,
          smartWalletAddress: smartAddress,
          userId,
        })
        .onConflictDoNothing()
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
      this.handler.handleError(e, AEM.ERROR_CREATING_SMART_ACCOUNT);
    }
  }

  async getSmartAddress(userId: string) {
    try {
      const result = await this.db.query.accounts.findFirst({
        where: eq(schema.accounts.userId, userId),
      });

      if (!(result && result.smartWalletAddress)) {
        throw new NotFoundException(AEM.ERROR_SMART_ADDRESS_NOT_FOUND);
      }

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.SMART_ADDRESS_FOUND,
        data: {
          smartAddress: result.smartWalletAddress,
        },
      });
    } catch (e) {
      this.handler.handleError(e, AEM.ERROR_GETTING_SMART_ADDRESS);
    }
  }

  async provideSmartWallet(userId: string) {
    const accountConfig = await this.provideAccountConfig(userId);
    return await createSmartAccountClient(accountConfig);
  }
}
