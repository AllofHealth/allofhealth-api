import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { Inject, Injectable } from '@nestjs/common';
import { TELEMED_TASK_ERROR_MESSAGE as TEM } from '../data/telemedicine.data';

@Injectable()
export class TelemedicineTasks {
  private readonly logger = new MyLoggerService(TelemedicineTasks.name);
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly _db: Database,
    private readonly handler: ErrorHandler,
  ) {}

  private async fetchAllEligibleBookings() {
    try {
    } catch (e) {
      this.handler.handleError(
        e,
        e.message || TEM.ERROR_FETCHING_ELIGIBLE_BOOKING,
      );
    }
  }
}
