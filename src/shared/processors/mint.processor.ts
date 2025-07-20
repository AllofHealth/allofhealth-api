import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { Process, Processor } from '@nestjs/bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Job } from 'bull';
import { MintHealthToken } from '../dtos/event.dto';
import { SharedEvents } from '../events/shared.events';

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
        new MintHealthToken(job.data.userId),
      );
    } catch (e) {
      this.logger.error(`Error minting health token: ${job.id}  ${e}`);
    }
  }
}
