import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { Inject, Injectable } from '@nestjs/common';
import {
  MAX_RETRY_COUNT,
  TELEMED_TASK_ERROR_MESSAGE as TEM,
} from '../data/telemedicine.data';
import * as schema from '@/schemas/schema';
import { and, eq, lt } from 'drizzle-orm';
import { IPendingBookingData } from '../interface/telemedicine.interface';

@Injectable()
export class TelemedicineTasks {
  private readonly logger = new MyLoggerService(TelemedicineTasks.name);
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly _db: Database,
    private readonly handler: ErrorHandler,
  ) {}

  private async fetchAllEligibleBookings() {
    try {
      const pendingBookings = await this._db
        .select({
          id: schema.consultationBookings.id,
          patientEmail: schema.user.emailAddress,
          consultationType: schema.consultationTypes.name,
          startTime: schema.consultationBookings.startTime,
          endTime: schema.consultationBookings.endTime,
        })
        .from(schema.consultationBookings)
        .leftJoin(
          schema.user,
          eq(schema.consultationBookings.patientId, schema.user.id),
        )
        .leftJoin(
          schema.consultationTypes,
          eq(
            schema.consultationTypes.id,
            schema.consultationBookings.consultationId,
          ),
        )
        .where(
          and(
            eq(schema.consultationBookings.paymentStatus, 'pending'),
            lt(schema.consultationBookings.reminderRetryCount, MAX_RETRY_COUNT),
          ),
        );

      let qualifiedBookings: IPendingBookingData[] = [];

      pendingBookings.map(async (booking) => {
        if (booking.endTime < new Date(Date.now())) {
          qualifiedBookings.push(booking);
        } else {
          await this._db
            .delete(schema.consultationBookings)
            .where(eq(schema.consultationBookings, booking.id));
        }
      });

      return qualifiedBookings;
    } catch (e) {
      this.handler.handleError(
        e,
        e.message || TEM.ERROR_FETCHING_ELIGIBLE_BOOKING,
      );
    }
  }
}
