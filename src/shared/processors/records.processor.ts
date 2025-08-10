import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { EAddMedicalRecordToContract } from '../dtos/event.dto';
import { HttpStatus, Inject } from '@nestjs/common';
import { ContractService } from '@/modules/contract/service/contract.service';

@Processor('create-record-queue')
export class CreateRecordProcessor {
  private readonly logger = new MyLoggerService('CreateRecordProcessor');
  constructor(private readonly contractService: ContractService) {}

  @Process('record-to-contract')
  async createRecord(job: Job<EAddMedicalRecordToContract>) {
    this.logger.log(`Processing job ${job.id}`);
    try {
      await this.contractService.addMedicalRecordToContract(job.data);
    } catch (e) {
      this.logger.error(`Error processing job ${job.id}`, e);
    }
  }

  @OnQueueFailed()
  async handleFailedJob(
    job: Job<EAddMedicalRecordToContract>,
    error: ErrorEvent,
  ) {
    this.logger.error(`Failed job ${job.id}`);
  }

  private async handlePermanentFailure(job: Job<EAddMedicalRecordToContract>) {}
}
