import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DailyTasksProvider } from '../provider/daily-tasks.provider';
import { RewardProvider } from '@/modules/reward/provider/reward.provider';
import { SharedEvents } from '@/shared/events/shared.events';
import { EUpdateTaskCount } from '@/shared/dtos/event.dto';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import {
  ICompleteTask,
  IGenerateDailyTasks,
  IGetTaskStats,
  IGetUserDailyTasks,
  IHandleApprovalAcceptance,
  IHandleHealthInfoCompletion,
  IHandleHealthJournalCompletion,
  IHandleMedicalRecordCreation,
} from '../interface/daily-tasks.interface';
import { TASK_ACTIONS } from '../data/daily-task.data';

@Injectable()
export class DailyTasksService {
  private readonly logger = new MyLoggerService(DailyTasksService.name);

  constructor(
    private readonly dailyTasksProvider: DailyTasksProvider,
    private readonly rewardProvider: RewardProvider,
  ) {}

  @OnEvent(SharedEvents.TASK_COMPLETED)
  async handleTaskCompleted(payload: EUpdateTaskCount) {
    const { userId, action, actionId } = payload;
    try {
      this.logger.debug(`Handling task completion for user: ${payload.userId}`);
      switch (action) {
        case 'COMPLETE_HEALTH_INFO':
          return await this.handleHealthInfoCompletion({
            userId,
            healthInfoId: actionId as string,
          });
        case 'CREATE_MEDICAL_RECORD':
          return await this.handleMedicalRecordCreation({
            doctorUserId: userId,
            recordId: actionId as string,
          });
        case 'ACCEPT_APPROVAL':
          return await this.handleApprovalAcceptance({
            doctorUserId: userId,
            approvalId: actionId as string,
          });
        case 'ADD_HEALTH_JOURNAL':
          return await this.handleHealthJournalCompletion({
            userId,
            journalId: actionId as string,
          });
      }
    } catch (error) {
      this.logger.error(`Error handling task completion: ${error.message}`);
    }
  }

  async generateUserTasks(ctx: IGenerateDailyTasks) {
    return await this.dailyTasksProvider.generateDailyTasks(ctx);
  }

  async getUserTasks(ctx: IGetUserDailyTasks) {
    return await this.dailyTasksProvider.getUserDailyTasks(ctx);
  }

  async getUserTaskStats(ctx: IGetTaskStats) {
    return await this.dailyTasksProvider.getTaskStats(ctx);
  }

  async completeTask(ctx: ICompleteTask) {
    return await this.dailyTasksProvider.completeTask(ctx);
  }

  async initializeTaskTypes() {
    return await this.dailyTasksProvider.initializeTaskTypes();
  }

  async handleApprovalAcceptance(ctx: IHandleApprovalAcceptance) {
    const { doctorUserId, approvalId } = ctx;
    try {
      const result = await this.completeTask({
        userId: doctorUserId,
        actionType: TASK_ACTIONS.ACCEPT_APPROVAL,
        relatedEntityId: approvalId,
        relatedEntityType: 'approval',
      });

      if (!('data' in result && result)) {
        return;
      }

      if (result.data?.taskCompleted) {
        await this.rewardProvider.incrementDailyCount(doctorUserId);
        this.logger.debug(
          `Daily task and reward updated for doctor ${doctorUserId} - approval ${approvalId}`,
        );
      }

      return result;
    } catch (error) {
      this.logger.error(`Error handling approval acceptance: ${error.message}`);
      throw error;
    }
  }

  async handleMedicalRecordCreation(ctx: IHandleMedicalRecordCreation) {
    const { doctorUserId, recordId } = ctx;
    try {
      const result = await this.completeTask({
        userId: doctorUserId,
        actionType: TASK_ACTIONS.CREATE_MEDICAL_RECORD,
        relatedEntityId: recordId,
        relatedEntityType: 'medical_record',
      });

      if (!('data' in result && result.data)) {
        this.logger.error(
          `Error handling medical record creation: ${result.message}`,
        );
        return;
      }

      if (result.data?.taskCompleted) {
        await this.rewardProvider.incrementDailyCount(doctorUserId);
        this.logger.debug(
          `Daily task and reward updated for doctor ${doctorUserId} - record ${recordId}`,
        );
      }

      return result;
    } catch (error) {
      this.logger.error(`Error handling record creation: ${error.message}`);
      throw error;
    }
  }

  async handleHealthInfoCompletion(ctx: IHandleHealthInfoCompletion) {
    const { userId, healthInfoId } = ctx;
    try {
      const result = await this.completeTask({
        userId,
        actionType: TASK_ACTIONS.COMPLETE_HEALTH_INFO,
        relatedEntityId: healthInfoId,
        relatedEntityType: 'health_information',
      });
      if (!('data' in result && result.data)) {
        this.logger.error(
          `Invalid response from completeTask: ${JSON.stringify(result)}`,
        );
        return;
      }

      if (result.data?.taskCompleted) {
        await this.rewardProvider.incrementDailyCount(userId);
        this.logger.debug(
          `Daily task and reward updated for user ${userId} - health info ${healthInfoId}`,
        );
      }

      return result;
    } catch (error) {
      this.logger.error(
        `Error handling health info completion: ${error.message}`,
      );
      throw error;
    }
  }

  async handleHealthJournalCompletion(ctx: IHandleHealthJournalCompletion) {
    const { userId, journalId } = ctx;
    try {
      const result = await this.completeTask({
        userId,
        actionType: TASK_ACTIONS.ADD_HEALTH_JOURNAL,
        relatedEntityId: journalId,
        relatedEntityType: 'health_journal',
      });
      if (!('data' in result && result.data)) {
        this.logger.error(
          `Invalid response from completeTask: ${JSON.stringify(result)}`,
        );
        return;
      }

      if (result.data?.taskCompleted) {
        await this.rewardProvider.incrementDailyCount(userId);
        this.logger.debug(
          `Daily task and reward updated for user ${userId} - health journal ${journalId}`,
        );
      }

      return result;
    } catch (error) {
      this.logger.error(
        `Error handling health journal completion: ${error.message}`,
      );
      throw error;
    }
  }

  async cleanupOldTasks(daysToKeep: number = 30) {
    return await this.dailyTasksProvider.cleanupOldTasks(daysToKeep);
  }
}
