import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { EAddMedicalRecordToContract } from '@/shared/dtos/event.dto';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import type { Queue } from 'bull';

@Injectable()
export class CreateRecordQueue {
  private readonly logger = new MyLoggerService(CreateRecordQueue.name);
  constructor(
    @InjectQueue('create-record-queue')
    private readonly createRecordQueue: Queue,
  ) {}

  async createRecordJob(data: EAddMedicalRecordToContract) {
    this.logger.debug('Creating record job');
    await this.createRecordQueue.add('record-to-contract', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }
}
