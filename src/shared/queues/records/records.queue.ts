import { EAddMedicalRecordToContract } from '@/shared/dtos/event.dto';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import type { Queue } from 'bull';

@Injectable()
export class CreateRecordQueue {
  constructor(
    @InjectQueue('create-record-queue')
    private readonly createRecordQueue: Queue,
  ) {}

  async createRecordJob(data: EAddMedicalRecordToContract) {
    await this.createRecordQueue.add('record-to-contract', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }
}
