import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class CreateSmartAccountQueue {
  constructor(
    @InjectQueue('create-smart-account-queue')
    private readonly createSmartAccountQueue: Queue,
  ) {}

  async createSmartAccountJob() {
    await this.createSmartAccountQueue.add('create-smart-account', {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }
}
