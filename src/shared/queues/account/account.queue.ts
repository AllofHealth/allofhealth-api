import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import type { Queue } from 'bull';
import type { CreateSmartAccount } from '@/shared/dtos/event.dto';

@Injectable()
export class CreateSmartAccountQueue {
  constructor(
    @InjectQueue('create-smart-account-queue')
    private readonly createSmartAccountQueue: Queue,
  ) {}

  async createSmartAccountJob(data: CreateSmartAccount) {
    await this.createSmartAccountQueue.add('create-smart-account', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }
}
