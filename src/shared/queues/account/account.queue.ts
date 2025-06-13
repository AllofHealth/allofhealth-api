import { CreateSmartAccount } from '@/shared/dtos/event.dto';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

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
