import * as schema from '@/schemas/schema';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { ExternalAccountService } from '@/shared/modules/external-account/service/external-account.service';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import {
  WALLET_ERROR_MESSAGES as WEM,
  WALLET_SUCCESS_MESSAGES as WSM,
} from '../data/wallet.data';

@Injectable()
export class WalletProvider {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
    private readonly eoaService: ExternalAccountService,
    private readonly handler: ErrorHandler,
  ) {}

  async fetchUserWallet(userId: string) {
    try {
      const wallet = await this.db
        .select({
          smartWalletAddress: schema.accounts.smartWalletAddress,
          updatedAt: schema.accounts.updatedAt,
        })
        .from(schema.accounts)
        .where(eq(schema.accounts.userId, userId));

      if (!wallet || wallet.length === 0) {
        return this.handler.handleReturn({
          status: HttpStatus.NOT_FOUND,
          message: WEM.NOT_FOUND,
        });
      }

      const walletBalance = await this.eoaService.getBalance(
        wallet[0].smartWalletAddress,
      );

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: WSM.SUCCESS_FETCHING_WALLET,
        data: {
          walletAddress: wallet[0].smartWalletAddress,
          balance: walletBalance,
          lastUpdated: wallet[0].updatedAt,
        },
      });
    } catch (e) {
      return this.handler.handleError(e, WEM.ERROR_FETCHING_WALLET);
    }
  }
}
