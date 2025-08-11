import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { Process, Processor } from '@nestjs/bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Job } from 'bull';
import { MintHealthToken, BatchMintHealthToken } from '../dtos/event.dto';
import { SharedEvents } from '../events/shared.events';
import { UnsafeRawSql } from '@neondatabase/serverless';
import { IRewardUsers } from '@/modules/reward/interface/reward.interface';

interface BatchProcessingResult {
  successful: IRewardUsers[];
  failed: { userId: string; error: string }[];
  totalProcessed: number;
}

@Processor('mint-health-token')
export class MintHealthTokenProcessor {
  private readonly logger = new MyLoggerService(MintHealthTokenProcessor.name);

  constructor(private readonly eventEmiiter: EventEmitter2) {}

  @Process('mint-health-token')
  async handleMintHealthToken(job: Job<MintHealthToken>) {
    try {
      this.logger.log(`Minting health token for user ${job.data.userId}`);
      await this.eventEmiiter.emitAsync(
        SharedEvents.MINT_HEALTH_TOKEN,
        new MintHealthToken(job.data.userId, job.data.amount),
      );
    } catch (e) {
      this.logger.error(`Error minting health token: ${job.id}  ${e}`);
    }
  }

  @Process('batch-mint-health-token')
  async handleBatchMintHealthToken(job: Job<BatchMintHealthToken>) {
    const {
      users,
      batchSize = 10,
      delayBetweenBatches = 100,
      continueOnError = true,
    } = job.data;
    const result: BatchProcessingResult = {
      successful: [],
      failed: [],
      totalProcessed: 0,
    };

    this.logger.log(
      `Starting batch minting for ${users.length} users in chunks of ${batchSize} (continueOnError: ${continueOnError})`,
    );

    try {
      // Process users in batches to avoid overwhelming the system
      for (let i = 0; i < users.length; i += batchSize) {
        const chunk = users.slice(i, i + batchSize);
        await this.processBatch(chunk, result, continueOnError);

        // Add configurable delay between batches to prevent system overload
        if (i + batchSize < users.length && delayBetweenBatches > 0) {
          await new Promise((resolve) =>
            setTimeout(resolve, delayBetweenBatches),
          );
        }
      }

      this.logger.log(
        `Batch minting completed. Successful: ${result.successful.length}, Failed: ${result.failed.length}, Total: ${result.totalProcessed}`,
      );
    } catch (e) {
      this.logger.error(`Critical error in batch minting job ${job.id}: ${e}`);
      throw e;
    }
  }

  private async processBatch(
    users: IRewardUsers[],
    result: BatchProcessingResult,
    continueOnError: boolean = true,
  ): Promise<void> {
    const promises = users.map(async (user) => {
      try {
        await this.eventEmiiter.emitAsync(
          SharedEvents.MINT_HEALTH_TOKEN,
          new MintHealthToken(user.userId, user.amount),
        );
        result.successful.push(user);
        this.logger.debug(`Successfully minted token for user: ${user.userId}`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        result.failed.push({ userId: user.userId, error: errorMessage });
        this.logger.warn(
          `Failed to mint token for user ${user.userId}: ${errorMessage}`,
        );

        // If continueOnError is false, rethrow the error to stop processing
        if (!continueOnError) {
          throw error;
        }
      }
      result.totalProcessed++;
    });

    if (continueOnError) {
      await Promise.allSettled(promises);
    } else {
      await Promise.all(promises);
    }
  }
}
