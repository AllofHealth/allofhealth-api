import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import {
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ICancelBooking,
  ICreateBooking,
  IFindBooking,
  IGetDoctorBookings,
  IGetPatientBookings,
  IUpdateBookingStatus,
  IUpdatePaymentDetails,
  IUpdateVideoRoom,
} from '../interface/booking.interface';
import {
  BOOKING_ERROR_MESSAGES as BEM,
  BOOKING_SUCCESS_MESSAGES as BSM,
} from '../data/booking.data';
import * as schema from '@/schemas/schema';
import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';

@Injectable()
export class BookingProvider {
  private readonly logger = new MyLoggerService(BookingProvider.name);
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly _db: Database,
    private readonly handler: ErrorHandler,
  ) {}

  async createBooking(ctx: ICreateBooking) {
    try {
      const [booking] = await this._db
        .insert(schema.consultationBookings)
        .values({
          bookingReference: ctx.bookingReference,
          patientId: ctx.patientId,
          doctorId: ctx.doctorId,
          consultationTypeId: ctx.consultationTypeId,
          consultationDate: ctx.consultationDate.toISOString(),
          startTime: ctx.startTime,
          endTime: ctx.endTime,
          timezone: ctx.timezone,
          amount: ctx.amount.toString(),
          currency: ctx.currency,
          status: 'pending_payment',
          paymentStatus: 'pending',
          externalProvider: 'calcom',
          externalBookingId: ctx.externalBookingId,
          externalBookingUrl: ctx.externalBookingUrl,
          videoPlatform: 'doxy',
          metadata: ctx.metadata || {},
        })
        .returning({
          bookingId: schema.consultationBookings.id,
          bookingReference: schema.consultationBookings.bookingReference,
          patientId: schema.consultationBookings.patientId,
          doctorId: schema.consultationBookings.doctorId,
          consultationTypeId: schema.consultationBookings.consultationTypeId,
          consultationDate: schema.consultationBookings.consultationDate,
          startTime: schema.consultationBookings.startTime,
          endTime: schema.consultationBookings.endTime,
          timezone: schema.consultationBookings.timezone,
          amount: schema.consultationBookings.amount,
          currency: schema.consultationBookings.currency,
          status: schema.consultationBookings.status,
          paymentStatus: schema.consultationBookings.paymentStatus,
        });

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: BSM.SUCCESS_CREATE_BOOKING,
        data: booking,
      });
    } catch (e) {
      this.handler.handleError(e, e.message || BEM.ERROR_CREATE_BOOKING);
    }
  }

  private async findBookingById(bookingId: string) {
    try {
      const [booking] = await this._db
        .select()
        .from(schema.consultationBookings)
        .where(eq(schema.consultationBookings.id, bookingId))
        .limit(1);

      if (!booking) {
        throw new NotFoundException(BEM.BOOKING_NOT_FOUND);
      }

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: BSM.SUCCESS_FIND_BOOKING,
        data: booking,
      });
    } catch (e) {
      this.logger.log(`${e.message || BEM.ERROR_FINDING_BOOKING}`);
      throw e;
    }
  }

  private async findBookingByExternalId(externalBookingId: string) {
    try {
      const [booking] = await this._db
        .select()
        .from(schema.consultationBookings)
        .where(
          eq(schema.consultationBookings.externalBookingId, externalBookingId),
        )
        .limit(1);

      if (!booking) {
        throw new NotFoundException(BEM.BOOKING_NOT_FOUND);
      }

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: BSM.SUCCESS_FIND_BOOKING,
        data: booking,
      });
    } catch (e) {
      this.logger.log(`${e.message || BEM.ERROR_FINDING_BOOKING}`);
      throw e;
    }
  }

  private async findBookingByReference(reference: string) {
    try {
      const [booking] = await this._db
        .select()
        .from(schema.consultationBookings)
        .where(eq(schema.consultationBookings.bookingReference, reference))
        .limit(1);

      if (!booking) {
        throw new NotFoundException(BEM.BOOKING_NOT_FOUND);
      }

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: BSM.SUCCESS_FIND_BOOKING,
        data: booking,
      });
    } catch (e) {
      this.logger.log(`${e.message || BEM.ERROR_FINDING_BOOKING}`);
      throw e;
    }
  }

  async updateBookingStatus(ctx: IUpdateBookingStatus) {
    const { bookingId, status, paymentStatus } = ctx;
    try {
      const updateData: any = { status };
      if (paymentStatus) {
        updateData.paymentStatus = paymentStatus;
      }

      const [booking] = await this._db
        .update(schema.consultationBookings)
        .set(updateData)
        .where(eq(schema.consultationBookings.id, bookingId))
        .returning({
          bookingId: schema.consultationBookings.id,
          bookingReference: schema.consultationBookings.bookingReference,
          patientId: schema.consultationBookings.patientId,
          doctorId: schema.consultationBookings.doctorId,
          status: schema.consultationBookings.status,
        });

      if (!booking) {
        throw new NotFoundException(BEM.BOOKING_NOT_FOUND);
      }

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: BSM.SUCCESS_UPDATE_BOOKING_STATUS,
        data: booking,
      });
    } catch (e) {
      this.handler.handleError(
        e,
        e.message || BEM.ERROR_UPDATING_BOOKING_STATUS,
      );
    }
  }

  async updateVideoRoom(ctx: IUpdateVideoRoom) {
    const { bookingId, videoRoomId, videoRoomUrl } = ctx;
    try {
      const [booking] = await this._db
        .update(schema.consultationBookings)
        .set({
          videoRoomId,
          videoRoomUrl,
        })
        .where(eq(schema.consultationBookings.id, bookingId))
        .returning({
          bookingId: schema.consultationBookings.id,
          bookingReference: schema.consultationBookings.bookingReference,
          patientId: schema.consultationBookings.patientId,
          doctorId: schema.consultationBookings.doctorId,
          status: schema.consultationBookings.status,
          videoRoomId: schema.consultationBookings.videoRoomId,
          videoRoomUrl: schema.consultationBookings.videoRoomUrl,
        });
      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: BSM.SUCCESS_UPDATING_VIDEO_ROOM,
        data: booking,
      });
    } catch (e) {
      this.handler.handleError(e, e.message || BEM.ERROR_UPDATING_VIDEO_ROOM);
    }
  }

  async updatePaymentDetails(ctx: IUpdatePaymentDetails) {
    const { bookingId, paymentIntentId, paidAt } = ctx;
    try {
      const [booking] = await this._db
        .update(schema.consultationBookings)
        .set({
          paymentIntentId,
          paymentStatus: 'paid',
          paidAt: paidAt || new Date(),
        })
        .where(eq(schema.consultationBookings.id, bookingId))
        .returning({
          bookingId: schema.consultationBookings.id,
          bookingReference: schema.consultationBookings.bookingReference,
          patientId: schema.consultationBookings.patientId,
          doctorId: schema.consultationBookings.doctorId,
          status: schema.consultationBookings.status,
          videoRoomId: schema.consultationBookings.videoRoomId,
          videoRoomUrl: schema.consultationBookings.videoRoomUrl,
        });

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: BSM.SUCCESS_UPDATING_PAYMENT_DETAILS,
        data: booking,
      });
    } catch (e) {
      this.handler.handleError(
        e,
        e.message || BEM.ERROR_UPDATING_PAYMENT_DETAILS,
      );
    }
  }

  async cancelBooking(ctx: ICancelBooking) {
    const { bookingId, uid, cancelledBy, reason } = ctx;
    const id = bookingId ? bookingId : uid;
    const whereClause = bookingId
      ? eq(schema.consultationBookings.id, bookingId)
      : eq(schema.consultationBookings.externalBookingId, uid!);
    try {
      const [booking] = await this._db
        .update(schema.consultationBookings)
        .set({
          status: 'cancelled',
          cancelledAt: new Date(),
          cancelledBy,
          cancellationReason: reason,
        })
        .where(whereClause)
        .returning({
          bookingId: schema.consultationBookings.id,
          bookingReference: schema.consultationBookings.bookingReference,
          patientId: schema.consultationBookings.patientId,
          doctorId: schema.consultationBookings.doctorId,
          status: schema.consultationBookings.status,
          videoRoomId: schema.consultationBookings.videoRoomId,
          videoRoomUrl: schema.consultationBookings.videoRoomUrl,
        });

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: BSM.SUCCESS_CANCELING_BOOKING,
        data: booking,
      });
    } catch (e) {
      this.handler.handleError(e, e.message || BEM.ERROR_CANCELING_BOOKING);
    }
  }

  async getPatientBookings(ctx: IGetPatientBookings) {
    const { patientId, page = 1, limit = 12, status } = ctx;
    const skip = (page - 1) * limit;
    try {
      let whereClause: any = eq(
        schema.consultationBookings.patientId,
        patientId,
      );
      if (status) {
        whereClause = and(
          whereClause,
          eq(schema.consultationBookings.status, status),
        );
      }

      const totalPatientBookingsResult = await this._db
        .select({ count: sql`count(*)`.as('count') })
        .from(schema.consultationBookings)
        .where(eq(schema.consultationBookings.patientId, patientId));

      const totalCount = Number(totalPatientBookingsResult[0]?.count ?? 0);
      const totalPages = Math.ceil(totalCount / limit);

      const [bookings] = await this._db
        .select({
          bookingId: schema.consultationBookings.id,
          bookingReference: schema.consultationBookings.bookingReference,
          patientId: schema.consultationBookings.patientId,
          doctorId: schema.consultationBookings.doctorId,
          status: schema.consultationBookings.status,
          videoRoomId: schema.consultationBookings.videoRoomId,
          videoRoomUrl: schema.consultationBookings.videoRoomUrl,
        })
        .from(schema.consultationBookings)
        .where(whereClause)
        .offset(skip)
        .limit(limit);

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: BSM.SUCCESS_GETTING_PATIENT_BOOKINGS,
        data: bookings,
        meta: {
          currentPage: page,
          totalPages,
          totalCount,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      });
    } catch (e) {
      this.handler.handleError(
        e,
        e.message || BEM.ERROR_GETTING_PATIENT_BOOKINGS,
      );
    }
  }

  async getDoctorBookings(ctx: IGetDoctorBookings) {
    const { doctorId, endDate, startDate, limit = 12, page = 1 } = ctx;
    const skip = (page - 1) * limit;
    try {
      const conditions = [eq(schema.consultationBookings.doctorId, doctorId)];

      if (startDate) {
        conditions.push(
          gte(
            schema.consultationBookings.consultationDate,
            startDate.toISOString(),
          ),
        );
      }

      if (endDate) {
        conditions.push(
          lte(
            schema.consultationBookings.consultationDate,
            endDate.toISOString(),
          ),
        );
      }

      const whereClause = and(...conditions);

      const totalDoctorBookingsResult = await this._db
        .select({ count: sql`count(*)`.as('count') })
        .from(schema.consultationBookings)
        .where(eq(schema.consultationBookings.doctorId, doctorId));

      const totalCount = Number(totalDoctorBookingsResult[0]?.count ?? 0);
      const totalPages = Math.ceil(totalCount / limit);

      const bookings = await this._db
        .select({
          bookingId: schema.consultationBookings.id,
          bookingReference: schema.consultationBookings.bookingReference,
          patientId: schema.consultationBookings.patientId,
          doctorId: schema.consultationBookings.doctorId,
          status: schema.consultationBookings.status,
          videoRoomId: schema.consultationBookings.videoRoomId,
          videoRoomUrl: schema.consultationBookings.videoRoomUrl,
        })
        .from(schema.consultationBookings)
        .where(whereClause)
        .offset(skip)
        .limit(limit);

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: BSM.SUCCESS_GETTING_DOCTOR_BOOKINGS,
        data: bookings,
        meta: {
          currentPage: page,
          totalPages,
          totalCount,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      });
    } catch (e) {
      this.handler.handleError(
        e,
        e.message || BEM.ERROR_GETTING_DOCTOR_BOOKINGS,
      );
    }
  }

  async findBooking(ctx: IFindBooking) {
    try {
      switch (ctx.opts) {
        case 'ext_id':
          return this.findBookingByExternalId(ctx.extId!);
        case 'id':
          return this.findBookingById(ctx.id!);
        case 'ref':
          return this.findBookingByReference(ctx.refId!);
      }
    } catch (e) {
      this.handler.handleError(
        e,
        `An error occurred while finding booking for ${ctx.opts}: ${ctx.extId ? ctx.extId : ctx.refId ? ctx.refId : ctx.id}`,
      );
    }
  }

  generateBookingReference() {
    const prefix = 'AOH-TEL';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}${random}`;
  }
}
