import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import {
  EAddMedicalRecordToContract,
  EDeleteIpfsRecord,
  EUpdateReviewCount,
  EUpdateTaskCount,
} from '../dtos/event.dto';
import { ContractService } from '@/modules/contract/service/contract.service';
import { RecordsProvider } from '@/modules/records/provider/records.provider';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SharedEvents } from '../events/shared.events';

@Processor('create-record-queue')
export class CreateRecordProcessor {
  private readonly logger = new MyLoggerService('CreateRecordProcessor');

  constructor(
    private readonly contractService: ContractService,
    private readonly recordsProvider: RecordsProvider,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Process('record-to-contract')
  async createRecord(job: Job<EAddMedicalRecordToContract>) {
    this.logger.log(`Processing job ${job.id} for user ${job.data.userId}`);

    try {
      const result = await this.contractService.addMedicalRecordToContract({
        userId: job.data.userId,
        practitionerId: job.data.practitionerId,
        cid: job.data.cid,
        approvalId: job.data.approvalId,
        recordChainId: job.data.recordChainId,
      });

      this.logger.log(`Successfully processed job ${job.id}`);
      const taskData = new EUpdateTaskCount(
        job.data.userId,
        'CREATE_MEDICAL_RECORD',
        String(job.data.recordChainId),
      );
      this.eventEmitter.emit(SharedEvents.TASK_COMPLETED, taskData);
      this.eventEmitter.emit(
        SharedEvents.UPDATE_REVIEW_COUNT,
        new EUpdateReviewCount(job.data.userId, 'inc'),
      );
      return result;
    } catch (error) {
      this.logger.error(`Error processing job ${job.id}: ${error.message}`);

      throw error;
    }
  }

  @OnQueueFailed()
  async handleFailedJob(job: Job<EAddMedicalRecordToContract>, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
    this.logger.error(`Attempt ${job.attemptsMade} of ${job.opts.attempts}`);

    if (job.attemptsMade >= (job.opts.attempts || 3)) {
      this.logger.error(`Job ${job.id} has exhausted all attempts`);
      await this.handlePermanentFailure(job, error);
    }
  }

  private async handlePermanentFailure(
    job: Job<EAddMedicalRecordToContract>,
    error: Error,
  ) {
    try {
      const rollbackResult = await this.recordsProvider.rollbackRecordCreation({
        userId: job.data.userId,
        recordChainId: job.data.recordChainId,
      });

      this.logger.log(
        `Rollback success ${rollbackResult.success} for record chain id: ${rollbackResult.deletedRecordChainId}, rolled back chain id: ${rollbackResult.deletedRecordChainId}, r`,
      );

      /**
       * @todo: Failure handling and priming for manual rollback
       */
      // Additional failure handling
      // 1. Send notification to admin
      // 2. Store failure in a dead letter queue
      // 3. Send alert to monitoring service
      // 4. Create an incident ticket

      await this.logPermanentFailure(job, error);
    } catch (rollbackError) {
      this.logger.error(
        `Failed to rollback for job ${job.id}: ${rollbackError.message}`,
      );
    }
  }

  private async logPermanentFailure(
    job: Job<EAddMedicalRecordToContract>,
    error: Error,
  ) {
    this.logger.error(
      `Record failed to be added to contract and was tolled back, jobId: ${job.id}, error: ${error.message}, recordData: ${job.data}`,
    );

    this.eventEmitter.emit(
      SharedEvents.DELETE_IPFS_RECORD,
      new EDeleteIpfsRecord(job.data.userId, job.data.cid),
    );
  }
}
