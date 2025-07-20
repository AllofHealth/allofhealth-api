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
import { and, eq } from 'drizzle-orm';
import { DAILY_TARGET } from '@/shared/data/constants';

@Injectable()
export class RewardDistributionService {
  private readonly logger = new MyLoggerService(RewardDistributionService.name);
  constructor(
    private readonly mintTokenQueue: MintTokenQueue,
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
  ) {}

  async fetchQualifiedUsers() {
    try {
      const qualifiedUsers = await this.db
        .select({ userId: schema.dailyReward.userId })
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

      const qualifiedUserIds: string[] = [];
      qualifiedUsers.forEach((user) => {
        qualifiedUserIds.push(user.userId);
      });

      return qualifiedUserIds;
    } catch (e) {
      throw new InternalServerErrorException('Failed to fetch qualified users');
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async rewardUser() {
    try {
      const qualifiedUsers = await this.fetchQualifiedUsers();

      if (!qualifiedUsers || qualifiedUsers.length === 0) {
        this.logger.log(`No qualified users found`);
        return;
      }

      await this.mintTokenQueue.mintHealthTokenJob({
        userIds: qualifiedUsers,
      });
    } catch (e) {
      this.logger.error('Error while rewarding users', e);
    }
  }

  @Cron('0 0 * * *') // Runs at midnight every day
  async resetDailyRewards() {
    try {
      this.logger.log('Starting daily reward reset at midnight');

      const result = await this.db.update(schema.dailyReward).set({
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
