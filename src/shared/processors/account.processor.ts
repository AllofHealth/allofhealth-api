import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { Process, Processor } from '@nestjs/bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Job } from 'bull';
import { SharedEvents } from '../events/shared.events';

@Processor('create-smart-account-queue')
export class CreateSmartAccountProcessor {
  private readonly logger = new MyLoggerService(
    CreateSmartAccountProcessor.name,
  );
  constructor(private readonly eventEmiiter: EventEmitter2) {}

  @Process('create-smart-account')
  async handleCreateSmartAccount(job: Job) {
    try {
      this.logger.debug('Processing create smart account');
      await this.eventEmiiter.emitAsync(SharedEvents.CREATE_SMART_ACCOUNT);
    } catch (e) {
      this.logger.error(`Error creating smart account: ${job.id}`, e);
    }
  }
}
