import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  REWARD_ERROR_MESSAGES as REM,
  REWARD_SUCCESS_MESSAGES as RSM,
} from '../data/reward.data';
import * as schema from '@/schemas/schema';

@Injectable()
export class RewardProvider {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
    private readonly handler: ErrorHandler,
  ) {}

  async createReward(userId: string) {
    try {
      await this.db.insert(schema.dailyReward).values({
        userId,
      });

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: RSM.REWARD_CREATED,
      });
    } catch (e) {
      return this.handler.handleError(e, REM.ERROR_CREATING_REWARD);
    }
  }
}
