import * as schema from '@/schemas/schema';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { and, count, desc, eq, sql } from 'drizzle-orm';
import {
  ICompleteTask,
  IGenerateDailyTasks,
  IGetTaskStats,
  IGetUserDailyTasks,
} from '../interface/daily-tasks.interface';
import { DEFAULT_TASK_TYPES } from '../data/daily-task.data';

@Injectable()
export class DailyTasksProvider {
  private static readonly MAX_DAILY_TASKS = 5;

  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
    private readonly handler: ErrorHandler,
  ) {}

  async generateDailyTasks(ctx: IGenerateDailyTasks) {
    const { userId } = ctx;
    const today = new Date().toISOString().split('T')[0];

    try {
      const existingTasks = await this.db
        .select()
        .from(schema.dailyTasks)
        .where(
          and(
            eq(schema.dailyTasks.userId, userId),
            eq(schema.dailyTasks.taskDate, today),
          ),
        );

      if (existingTasks.length > 0) {
        return this.getUserDailyTasks({ userId, date: today });
      }

      try {
        await this.generateDailyTasksForDate(userId, today);
        return this.getUserDailyTasks({ userId, date: today });
      } catch (error) {
        throw error;
      }
    } catch (e) {
      this.handler.handleError(e, e.message || 'Error generating daily tasks');
    }
  }

  async getUserDailyTasks(ctx: IGetUserDailyTasks) {
    const { userId, date } = ctx;
    const targetDate = date || new Date().toISOString().split('T')[0];

    try {
      const tasks = await this.db
        .select({
          id: schema.dailyTasks.id,
          userId: schema.dailyTasks.userId,
          taskTypeId: schema.dailyTasks.taskTypeId,
          taskDate: schema.dailyTasks.taskDate,
          isCompleted: schema.dailyTasks.isCompleted,
          completedAt: schema.dailyTasks.completedAt,
          tokenReward: schema.dailyTasks.tokenReward,
          taskType: schema.taskTypes,
        })
        .from(schema.dailyTasks)
        .leftJoin(
          schema.taskTypes,
          eq(schema.dailyTasks.taskTypeId, schema.taskTypes.id),
        )
        .where(
          and(
            eq(schema.dailyTasks.userId, userId),
            eq(schema.dailyTasks.taskDate, targetDate),
          ),
        )
        .orderBy(desc(schema.dailyTasks.createdAt));

      // If no tasks exist for the requested date, generate them
      if (tasks.length === 0) {
        await this.generateDailyTasksForDate(userId, targetDate);

        // Re-fetch the newly created tasks
        const newTasks = await this.db
          .select({
            id: schema.dailyTasks.id,
            userId: schema.dailyTasks.userId,
            taskTypeId: schema.dailyTasks.taskTypeId,
            taskDate: schema.dailyTasks.taskDate,
            isCompleted: schema.dailyTasks.isCompleted,
            completedAt: schema.dailyTasks.completedAt,
            tokenReward: schema.dailyTasks.tokenReward,
            taskType: schema.taskTypes,
          })
          .from(schema.dailyTasks)
          .leftJoin(
            schema.taskTypes,
            eq(schema.dailyTasks.taskTypeId, schema.taskTypes.id),
          )
          .where(
            and(
              eq(schema.dailyTasks.userId, userId),
              eq(schema.dailyTasks.taskDate, targetDate),
            ),
          )
          .orderBy(desc(schema.dailyTasks.createdAt));

        const formattedNewTasks = newTasks.map((task) => ({
          id: task.id,
          userId: task.userId,
          taskTypeId: task.taskTypeId,
          taskDate: task.taskDate,
          isCompleted: task.isCompleted,
          completedAt: task.completedAt || undefined,
          tokenReward: parseFloat(task.tokenReward),
          taskType: {
            id: task.taskType?.id || '',
            name: task.taskType?.name || '',
            description: task.taskType?.description || '',
            actionType: task.taskType?.actionType || '',
            applicableRoles: Array.isArray(task.taskType?.applicableRoles)
              ? task.taskType.applicableRoles
              : [],
            tokenReward: task.taskType?.tokenReward
              ? parseFloat(task.taskType.tokenReward)
              : 0,
          },
        }));

        return this.handler.handleReturn({
          status: HttpStatus.OK,
          message: 'Daily tasks generated and retrieved successfully',
          data: { tasks: formattedNewTasks },
        });
      }

      const formattedTasks = tasks.map((task) => ({
        id: task.id,
        userId: task.userId,
        taskTypeId: task.taskTypeId,
        taskDate: task.taskDate,
        isCompleted: task.isCompleted,
        completedAt: task.completedAt || undefined,
        tokenReward: parseFloat(task.tokenReward),
        taskType: {
          id: task.taskType?.id || '',
          name: task.taskType?.name || '',
          description: task.taskType?.description || '',
          actionType: task.taskType?.actionType || '',
          applicableRoles: Array.isArray(task.taskType?.applicableRoles)
            ? task.taskType.applicableRoles
            : [],
          tokenReward: task.taskType?.tokenReward
            ? parseFloat(task.taskType.tokenReward)
            : 0,
        },
      }));

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: 'Daily tasks retrieved successfully',
        data: { tasks: formattedTasks },
      });
    } catch (e) {
      this.handler.handleError(e, e.message || 'Error fetching daily tasks');
    }
  }

  /**
   * Generate daily tasks for a specific date
   * This is a helper method used by getUserDailyTasks when no tasks exist for a date
   */
  private async generateDailyTasksForDate(userId: string, targetDate: string) {
    try {
      const userData = await this.db
        .select({ role: schema.user.role })
        .from(schema.user)
        .where(eq(schema.user.id, userId))
        .limit(1);

      if (!userData.length) {
        throw new Error('User not found');
      }

      const userRole = userData[0].role;

      const availableTaskTypes = await this.db
        .select()
        .from(schema.taskTypes)
        .where(eq(schema.taskTypes.isActive, true));

      const applicableTaskTypes = availableTaskTypes.filter((taskType) => {
        const roles = Array.isArray(taskType.applicableRoles)
          ? taskType.applicableRoles
          : [];
        return roles.includes(userRole);
      });

      if (applicableTaskTypes.length === 0) {
        // No applicable tasks for user role - this is not an error
        return;
      }

      const selectedTaskTypes = this.shuffleArray(applicableTaskTypes).slice(
        0,
        DailyTasksProvider.MAX_DAILY_TASKS,
      );

      const tasksToCreate = selectedTaskTypes.map((taskType) => ({
        userId,
        taskTypeId: taskType.id,
        taskDate: targetDate,
        tokenReward: taskType.tokenReward,
      }));

      if (tasksToCreate.length > 0) {
        await this.db.insert(schema.dailyTasks).values(tasksToCreate);
      }
    } catch (e) {
      throw new Error(`Error generating daily tasks for date: ${e.message}`);
    }
  }

  async completeTask(ctx: ICompleteTask) {
    const { userId, actionType, relatedEntityId, relatedEntityType } = ctx;
    const today = new Date().toISOString().split('T')[0];

    try {
      const existingTasks = await this.db
        .select({ count: count() })
        .from(schema.dailyTasks)
        .where(
          and(
            eq(schema.dailyTasks.userId, userId),
            eq(schema.dailyTasks.taskDate, today),
          ),
        );

      // If no tasks exist for today, generate them first
      if (!existingTasks.length || existingTasks[0].count === 0) {
        await this.generateDailyTasksForDate(userId, today);
      }

      const incompleteTask = await this.db
        .select({
          dailyTaskId: schema.dailyTasks.id,
          tokenReward: schema.dailyTasks.tokenReward,
          taskTypeId: schema.dailyTasks.taskTypeId,
        })
        .from(schema.dailyTasks)
        .leftJoin(
          schema.taskTypes,
          eq(schema.dailyTasks.taskTypeId, schema.taskTypes.id),
        )
        .where(
          and(
            eq(schema.dailyTasks.userId, userId),
            eq(schema.dailyTasks.taskDate, today),
            eq(schema.dailyTasks.isCompleted, false),
            eq(schema.taskTypes.actionType, actionType),
          ),
        )
        .limit(1);

      if (!incompleteTask.length) {
        throw new BadRequestException('No matching incomplete task found');
      }

      const task = incompleteTask[0];

      await this.db.transaction(async (tx) => {
        await tx
          .update(schema.dailyTasks)
          .set({
            isCompleted: true,
            completedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(schema.dailyTasks.id, task.dailyTaskId));

        await tx.insert(schema.taskCompletions).values({
          dailyTaskId: task.dailyTaskId,
          userId,
          actionType,
          relatedEntityId,
          relatedEntityType,
          tokensAwarded: task.tokenReward,
        });

        const existingReward = await tx
          .select()
          .from(schema.dailyReward)
          .where(
            and(
              eq(schema.dailyReward.userId, userId),
              eq(schema.dailyReward.createdAt, today),
            ),
          )
          .limit(1);

        if (existingReward.length > 0) {
          await tx
            .update(schema.dailyReward)
            .set({
              dailyTaskCount: existingReward[0].dailyTaskCount + 1,
              updatedAt: new Date(),
            })
            .where(eq(schema.dailyReward.id, existingReward[0].id));
        } else {
          await tx.insert(schema.dailyReward).values({
            userId,
            dailyTaskCount: 1,
            createdAt: today,
            updatedAt: new Date(),
          });
        }
      });

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: 'Task completed successfully',
        data: {
          taskCompleted: true,
          tokensAwarded: parseFloat(task.tokenReward),
          taskId: task.dailyTaskId,
        },
      });
    } catch (e) {
      this.handler.handleError(e, e.message || 'Error completing task');
    }
  }

  async getTaskStats(ctx: IGetTaskStats) {
    const { userId, startDate, endDate } = ctx;
    const today = new Date().toISOString().split('T')[0];
    const start = startDate || today;
    const end = endDate || today;

    try {
      const [totalResult, completedResult, tokensResult] = await Promise.all([
        this.db
          .select({ count: count() })
          .from(schema.dailyTasks)
          .where(
            and(
              eq(schema.dailyTasks.userId, userId),
              eq(schema.dailyTasks.taskDate, start),
            ),
          ),

        this.db
          .select({ count: count() })
          .from(schema.dailyTasks)
          .where(
            and(
              eq(schema.dailyTasks.userId, userId),
              eq(schema.dailyTasks.taskDate, start),
              eq(schema.dailyTasks.isCompleted, true),
            ),
          ),

        this.db
          .select({
            total: sql<number>`COALESCE(SUM(${schema.taskCompletions.tokensAwarded}), 0)`,
          })
          .from(schema.taskCompletions)
          .where(eq(schema.taskCompletions.userId, userId)),
      ]);

      const totalTasks = totalResult[0]?.count || 0;
      const completedTasks = completedResult[0]?.count || 0;
      const totalTokensEarned = Number(tokensResult[0]?.total) || 0;
      const completionRate =
        totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: 'Task statistics retrieved successfully',
        data: {
          totalTasks,
          completedTasks,
          totalTokensEarned,
          completionRate: Math.round(completionRate * 100) / 100,
        },
      });
    } catch (e) {
      this.handler.handleError(
        e,
        e.message || 'Error fetching task statistics',
      );
    }
  }

  async initializeTaskTypes() {
    try {
      for (const taskType of DEFAULT_TASK_TYPES) {
        await this.db
          .insert(schema.taskTypes)
          .values(taskType)
          .onConflictDoNothing();
      }

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: 'Task types initialized successfully',
      });
    } catch (e) {
      this.handler.handleError(e, 'Error initializing task types');
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async cleanupOldTasks(daysToKeep: number = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      const cutoffDateString = cutoffDate.toISOString().split('T')[0];

      await this.db
        .delete(schema.dailyTasks)
        .where(
          and(
            eq(schema.dailyTasks.isCompleted, true),
            sql`${schema.dailyTasks.taskDate} < ${cutoffDateString}`,
          ),
        );

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: `Cleaned up tasks older than ${daysToKeep} days`,
      });
    } catch (e) {
      this.handler.handleError(e, 'Error cleaning up old tasks');
    }
  }
}
