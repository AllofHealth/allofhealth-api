import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { MintTokenQueue } from '@/shared/queues/mint/mint.queue';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as schema from '@/schemas/schema';
import { and, eq, gt } from 'drizzle-orm';
import { DAILY_TARGET } from '@/shared/data/constants';
import { IRewardUsers } from '../interface/reward.interface';

@Injectable()
export class RewardDistributionService {
  private readonly logger = new MyLoggerService(RewardDistributionService.name);
  constructor(
    private readonly mintTokenQueue: MintTokenQueue,
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
  ) {}

  async fetchUsers() {
    try {
      const qualifiedUsers = await this.db
        .select({
          userId: schema.dailyReward.userId,
          taskCount: schema.dailyReward.dailyTaskCount,
        })
        .from(schema.dailyReward)
        .where(
          and(
            gt(schema.dailyReward.dailyTaskCount, 0),
            eq(schema.dailyReward.isTokenMinted, false),
          ),
        );

      if (!qualifiedUsers || qualifiedUsers.length === 0) {
        this.logger.log(`No qualified users found`);
        return;
      }

      const qualifiedForRewards: IRewardUsers[] = [];
      qualifiedUsers.forEach((user) => {
        qualifiedForRewards.push({
          userId: user.userId,
          amount: user.taskCount,
        });
      });

      return qualifiedForRewards;
    } catch (e) {
      throw new InternalServerErrorException('Failed to fetch qualified users');
    }
  }

  async fetchQualifiedUsers() {
    try {
      const qualifiedUsers = await this.db
        .select({
          userId: schema.dailyReward.userId,
          taskCount: schema.dailyReward.dailyTaskCount,
        })
        .from(schema.dailyReward)
        .where(
          and(
            eq(schema.dailyReward.dailyTaskCount, DAILY_TARGET),
            eq(schema.dailyReward.isTokenMinted, false),
          ),
        );

      if (!qualifiedUsers || qualifiedUsers.length === 0) {
        this.logger.log(`No qualified users found`);
        return;
      }

      const qualifiedForRewards: IRewardUsers[] = [];
      qualifiedUsers.forEach((user) => {
        qualifiedForRewards.push({
          userId: user.userId,
          amount: user.taskCount,
        });
      });

      return qualifiedForRewards;
    } catch (e) {
      throw new InternalServerErrorException('Failed to fetch qualified users');
    }
  }

  @Cron(CronExpression.EVERY_2_HOURS)
  async rewardUser() {
    try {
      const qualifiedUsers = await this.fetchQualifiedUsers();

      if (!qualifiedUsers || qualifiedUsers.length === 0) {
        this.logger.log(`No qualified users found`);
        return;
      }

      await this.mintTokenQueue.mintHealthTokenJob({
        users: qualifiedUsers,
      });
    } catch (e) {
      this.logger.error('Error while rewarding users', e);
    }
  }

  @Cron('0 0 * * *') // Runs at midnight every day
  async resetDailyRewards() {
    try {
      const usersToReward = await this.fetchUsers();

      if (usersToReward && usersToReward.length > 0) {
        this.logger.debug(
          `Users with some task completed found. Final reward before reset`,
        );
        await this.mintTokenQueue.mintHealthTokenJob({
          users: usersToReward,
        });
      }

      this.logger.log('Starting daily reward reset at midnight');

      await this.db.update(schema.dailyReward).set({
        isTokenMinted: false,
        dailyTaskCount: 0,
      });

      this.logger.log('Successfully reset daily rewards for all users');
    } catch (e) {
      this.logger.error('Error while resetting daily rewards', e);
      throw new InternalServerErrorException('Failed to reset daily rewards');
    }
  }
}
