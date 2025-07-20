import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import {
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  REWARD_ERROR_MESSAGES as REM,
  REWARD_SUCCESS_MESSAGES as RSM,
} from '../data/reward.data';
import * as schema from '@/schemas/schema';
import { eq, sql } from 'drizzle-orm';

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

  async fetchReward(userId: string) {
    try {
      const reward = await this.db
        .select()
        .from(schema.dailyReward)
        .where(eq(schema.dailyReward.userId, userId))
        .limit(1);

      if (!reward || reward.length === 0) {
        throw new NotFoundException(REM.NOT_FOUND);
      }

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: RSM.REWARD_FETCHED,
        data: reward[0],
      });
    } catch (e) {
      throw new InternalServerErrorException(e, REM.NOT_FOUND);
    }
  }

  async incrementDailyCount(userId: string) {
    try {
      const reward = await this.fetchReward(userId);
      if (!reward.data || reward.status !== HttpStatus.OK) {
        return await this.createReward(userId);
      }

      if (reward.data.dailyTaskCount >= 5) {
        return;
      }

      await this.db.update(schema.dailyReward).set({
        dailyTaskCount: sql`${schema.dailyReward.dailyTaskCount} + 1`,
      });

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: RSM.REWARD_UPDATED,
      });
    } catch (e) {
      return this.handler.handleError(e, REM.ERROR_UPDATING_REWARD);
    }
  }

  async updateMintedState(userId: string, state: boolean) {
    try {
      await this.db
        .update(schema.dailyReward)
        .set({
          isTokenMinted: state,
        })
        .where(eq(schema.dailyReward.userId, userId));
    } catch (e) {
      return this.handler.handleError(e, REM.ERROR_UPDATING_REWARD);
    }
  }
}
