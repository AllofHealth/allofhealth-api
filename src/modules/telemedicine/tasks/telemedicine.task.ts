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
import { and, eq, lt, aliasedTable } from 'drizzle-orm';
import {
  IPendingBookingData,
  IReminderEmailPayload,
} from '../interface/telemedicine.interface';
import { BookingService } from '@/modules/booking/service/booking.service';
import { TelemedicineNotificationsQueue } from '@/shared/queues/telemedicine-notifications/telemedicine-notifications.queue';
import { TelemedicineError } from '../error/telemedicine.error';
import {
  formatDateToReadable,
  formatTimeReadable,
} from '@/shared/utils/date.utils';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TelemedicineTasks {
  private readonly logger = new MyLoggerService(TelemedicineTasks.name);
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly _db: Database,
    private readonly handler: ErrorHandler,
    private readonly bookingService: BookingService,
    private readonly reminderQueue: TelemedicineNotificationsQueue,
  ) {}

  private async fetchAllEligibleBookings() {
    try {
      const patient = aliasedTable(schema.user, 'patient');
      const doctor = aliasedTable(schema.user, 'doctor');

      const pendingBookings = await this._db
        .select({
          id: schema.consultationBookings.id,
          patientId: schema.consultationBookings.patientId,
          doctorId: schema.consultationBookings.doctorId,
          externalBookingId: schema.consultationBookings.externalBookingId,
          patientEmail: patient.emailAddress,
          patientFullName: patient.fullName,
          doctorFullName: doctor.fullName,
          consultationType: schema.consultationTypes.name,
          startTime: schema.consultationBookings.startTime,
          endTime: schema.consultationBookings.endTime,
        })
        .from(schema.consultationBookings)
        .leftJoin(
          patient,
          eq(schema.consultationBookings.patientId, patient.id),
        )
        .leftJoin(doctor, eq(schema.consultationBookings.doctorId, doctor.id))
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

  private async createReminderEmailPayload(ctx: IPendingBookingData[]) {
    let reminderPayload: IReminderEmailPayload[] = [];

    try {
      ctx.map(async (data) => {
        const dataWithPaymentUrl =
          await this.bookingService.intializeBookingPayment({
            calcomBookingId: data.externalBookingId!,
            patientId: data.patientId,
          });

        if (dataWithPaymentUrl) {
          const date = data.startTime;
          const time = data.startTime.getTime();
          const enrichedData = {
            patientName: data.patientFullName as string,
            doctorName: data.doctorFullName as string,
            consultationType: data.consultationType as string,
            to: data.patientEmail as string,
            paymentUrl: dataWithPaymentUrl.data.paymentLink,
            date: formatDateToReadable(date),
            time: formatTimeReadable(time),
          };

          reminderPayload.push(enrichedData);
        }
      });

      return reminderPayload;
    } catch (e) {
      this.handler.handleError(
        e,
        e.message || TEM.ERROR_CREATING_REMINDER_PAYLOAD,
      );
    }
  }

  @Cron(CronExpression.EVERY_12_HOURS)
  async sendPaymentReminders() {
    this.logger.log('Execting Reminder Tasks');
    try {
      const eligibleBookings = await this.fetchAllEligibleBookings();
      if (!eligibleBookings || eligibleBookings === undefined) {
        this.logger.log(`No eligible bookings`);
        return;
      }
      const bookingsWithPaymentUrl =
        await this.createReminderEmailPayload(eligibleBookings);

      if (!bookingsWithPaymentUrl) {
        this.logger.log('Could not add payment urls to booking payload');
        throw new TelemedicineError('Error adding payment url');
      }

      await this.reminderQueue.handleSendBatchReminderJob(
        bookingsWithPaymentUrl,
      );

      this.logger.log(`${eligibleBookings.length} reminders sent`);
    } catch (e) {
      this.handler.handleError(e, e.message || TEM.ERROR_RUNNING_REMINDER_TASK);
    }
  }
}
