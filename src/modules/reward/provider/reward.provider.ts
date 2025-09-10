import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  REWARD_ERROR_MESSAGES as REM,
  REWARD_SUCCESS_MESSAGES as RSM,
  REWARD_CONSTANTS as RC,
} from '../data/reward.data';
import * as schema from '@/schemas/schema';
import { and, eq, sql } from 'drizzle-orm';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import {
  IFetchClaimedRewards,
  IFetchTotalRewardPoints,
} from '../interface/reward.interface';
import { ContractService } from '@/modules/contract/service/contract.service';
import { formatDateToReadable } from '@/shared/utils/date.utils';

@Injectable()
export class RewardProvider {
  private readonly logger = new MyLoggerService(RewardProvider.name);
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
    @Inject(forwardRef(() => ContractService))
    private readonly contractService: ContractService,
    private readonly handler: ErrorHandler,
  ) {}

  private matchTaskToReward(taskCount: number) {
    switch (taskCount) {
      case 1:
        return '0.01';
      case 2:
        return '0.02';
      case 3:
        return '0.03';
      case 4:
        return '0.04';
      case 5:
        return '0.05';
      default:
        throw new Error(`Invalid task count`);
    }
  }

  private fetchTotalEarnedRewardPoints(ctx: IFetchTotalRewardPoints) {
    const { tokenBalance } = ctx;
    try {
      const balance = Number(tokenBalance);
      const pointsEarned = (balance * RC.POINTS_PER_REWARD) / RC.MIN_REWARD;
      return pointsEarned;
    } catch (e) {
      this.logger.error(`${REM.ERROR_FETCHING_TOTAL_REWARD_POINTS}`);
      throw new InternalServerErrorException(
        REM.ERROR_FETCHING_TOTAL_REWARD_POINTS,
      );
    }
  }

  private async fetchClaimedRewards(ctx: IFetchClaimedRewards) {
    const { userId, tokenBalance } = ctx;
    try {
      const rewardResult = await this.db.query.dailyReward.findFirst({
        where: eq(schema.dailyReward.userId, userId),
      });

      let lastUpdate: string = 'never';
      if (rewardResult) {
        if (rewardResult.updatedAt !== null) {
          lastUpdate = formatDateToReadable(rewardResult.updatedAt);
        }
      }

      return {
        totalRewardsClaimed: tokenBalance,
        lastClaimedDate: lastUpdate,
      };
    } catch (e) {
      this.logger.error(`${REM.ERROR_FETCHING_CLAIMED_BALANCE}, ${e}`);
      throw new HttpException(
        REM.ERROR_FETCHING_CLAIMED_BALANCE,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async fetchPendingRewards(userId: string) {
    try {
      let pendingReward: string = '0.05';
      let tokensEarnedToday: string = '0.0';
      let nextClaimedDate: string = formatDateToReadable(new Date());

      const dailyTaskCountResult = await this.db
        .select({
          taskCount: schema.dailyReward.dailyTaskCount,
        })
        .from(schema.dailyReward)
        .where(eq(schema.dailyReward.userId, userId));

      if (!dailyTaskCountResult || dailyTaskCountResult.length === 0) {
        this.logger.debug(`No daily task table`);
        return {
          pendingReward,
          tokensEarnedToday,
          nextClaimedDate,
        };
      }

      const taskCount = dailyTaskCountResult[0].taskCount || 0;
      this.logger.debug(`Task count ${taskCount}`);

      if (taskCount > 0) {
        tokensEarnedToday = this.matchTaskToReward(taskCount);
        if (taskCount == RC.MAX_TASK_COUNT) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          nextClaimedDate = formatDateToReadable(tomorrow);
        }
        const unclaimedRewards = Number(
          this.matchTaskToReward(RC.MAX_TASK_COUNT - taskCount),
        );
        pendingReward = String(unclaimedRewards);
      }

      return {
        pendingReward,
        tokensEarnedToday,
        nextClaimedDate,
      };
    } catch (e) {
      this.logger.error(`${REM.ERROR_FETCHING_PENDING_REWARDS}, ${e}`);
      throw new HttpException(
        REM.ERROR_FETCHING_PENDING_REWARDS,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
      this.handler.handleError(e, REM.ERROR_CREATING_REWARD);
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
      this.logger.debug(`No reward found creating reward`);
    }
  }

  async incrementDailyCount(userId: string) {
    try {
      const reward = await this.fetchReward(userId);
      if (!reward || !reward.data || reward.status !== HttpStatus.OK) {
        return await this.createReward(userId);
      }

      if (reward.data.dailyTaskCount >= 5) {
        return;
      }

      await this.db.update(schema.dailyReward).set({
        dailyTaskCount: sql`${schema.dailyReward.dailyTaskCount} + 1`,
        updatedAt: new Date().toISOString(),
      });

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: RSM.REWARD_UPDATED,
      });
    } catch (e) {
      this.handler.handleError(e, REM.ERROR_UPDATING_REWARD);
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
      this.handler.handleError(e, REM.ERROR_UPDATING_REWARD);
    }
  }

  async fetchRewardMetrics(userId: string) {
    try {
      const balance = await this.contractService.fetchTokenBalance(userId);
      if (!balance?.data) {
        throw new BadRequestException('Failed to fetch token balance');
      }
      const tokenBalance = balance.data;
      if (!tokenBalance) {
        return this.handler.handleReturn({
          status: HttpStatus.OK,
          message: REM.TOKEN_BALANCE_NOT_FOUND,
        });
      }

      const [claimedBalance, pendingRewards] = await Promise.all([
        this.fetchClaimedRewards({
          userId,
          tokenBalance,
        }),
        await this.fetchPendingRewards(userId),
      ]);

      const optimisticBalance =
        Number(tokenBalance) + Number(pendingRewards.tokensEarnedToday);

      const totalPointsEarned = this.fetchTotalEarnedRewardPoints({
        tokenBalance: String(optimisticBalance),
      });

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: RSM.REWARD_METRICS_FETCHED,
        data: {
          totalPointsEarned,
          claimedBalance,
          pendingRewards,
        },
      });
    } catch (e) {
      this.handler.handleError(e, REM.ERROR_FETCHING_REWARD_METIRCS);
    }
  }
}
