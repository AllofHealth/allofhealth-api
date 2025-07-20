import { MintHealthToken } from '@/shared/dtos/event.dto';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import type { Queue } from 'bull';

@Injectable()
export class MintTokenQueue {
  constructor(
    @InjectQueue('mint-health-token-queue')
    private readonly mintTokenQueue: Queue,
  ) {}

  async mintHealthTokenJob(data: MintHealthToken) {
    await this.mintTokenQueue.add('mint-health-token', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }
}
