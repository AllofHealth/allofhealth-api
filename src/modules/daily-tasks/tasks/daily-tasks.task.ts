import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Inject } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { DailyTasksService } from '../service/daily-tasks.service';
import * as schema from '@/schemas/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class DailyTasksTask {
  private readonly logger = new MyLoggerService(DailyTasksTask.name);

  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
    private readonly dailyTasksService: DailyTasksService,
  ) {}

  @Cron('0 1 * * *') // Runs at 1:00 AM every day
  async generateDailyTasksForAllUsers() {
    this.logger.log('Starting daily task generation for all users...');

    try {
      const users = await this.db
        .select({
          id: schema.user.id,
          fullName: schema.user.fullName,
          status: schema.user.status,
          role: schema.user.role,
        })
        .from(schema.user)
        .where(eq(schema.user.status, 'ACTIVE')); // Only generate tasks for active users

      if (!users || users.length === 0) {
        this.logger.log('No active users found to generate tasks for');
        return;
      }

      this.logger.log(
        `Found ${users.length} active users to generate tasks for`,
      );

      let successCount = 0;
      let errorCount = 0;

      // Generate tasks for each user
      for (const user of users) {
        try {
          this.logger.debug(
            `Generating daily tasks for user: ${user.id} (${user.fullName})`,
          );

          const result = await this.dailyTasksService.generateUserTasks({
            userId: user.id,
          });

          // Check if task generation was successful
          if (result && 'status' in result && result.status === 200) {
            successCount++;
            this.logger.debug(
              `Successfully generated tasks for user: ${user.id}`,
            );
          } else {
            errorCount++;
            this.logger.warn(
              `Task generation returned non-success status for user ${user.id}: ${result?.message || 'Unknown error'}`,
            );
          }
        } catch (error) {
          errorCount++;
          this.logger.error(
            `Failed to generate tasks for user ${user.id} (${user.fullName}): ${error.message}`,
          );
        }
      }

      this.logger.log(
        `Daily task generation completed. Success: ${successCount}, Errors: ${errorCount}, Total: ${users.length}`,
      );

      if (errorCount > 0) {
        this.logger.warn(
          `Task generation failed for ${errorCount} out of ${users.length} users`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Critical error during daily task generation: ${error.message}`,
      );

      if (error instanceof Error) {
        this.logger.error(`Error name: ${error.name}`);
        this.logger.error(`Error stack: ${error.stack}`);
      }
    }
  }

  async manualGenerateDailyTasks() {
    this.logger.log('Manual daily task generation triggered...');
    await this.generateDailyTasksForAllUsers();
  }

  async generateTasksForUser(userId: string) {
    try {
      this.logger.debug(`Generating tasks for specific user: ${userId}`);

      const result = await this.dailyTasksService.generateUserTasks({
        userId,
      });

      if (result && 'status' in result && result.status === 200) {
        this.logger.debug(`Successfully generated tasks for user: ${userId}`);
        return { success: true, userId };
      } else {
        this.logger.warn(
          `Task generation returned non-success status for user ${userId}: ${result?.message || 'Unknown error'}`,
        );
        return {
          success: false,
          userId,
          error: result?.message || 'Unknown error',
        };
      }
    } catch (error) {
      this.logger.error(
        `Failed to generate tasks for user ${userId}: ${error.message}`,
      );
      return { success: false, userId, error: error.message };
    }
  }

  @Cron('0 */6 * * *') // Every 6 hours
  async healthCheck() {
    this.logger.debug('Daily tasks cron job health check - service is running');
  }
}
