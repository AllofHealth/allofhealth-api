import { USER_ROLE, USER_STATUS } from '@/modules/user/data/user.data';
import * as schema from '@/schemas/schema';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import {
  ForbiddenException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import {
  AVAILABILITY_ERROR_MESSAGE as AEM,
  AVAILABILITY_SUCCESS_MESSAGE as ASM,
} from '../data/availability.data';
import {
  ICreateAvailability,
  IDeleteAvailability,
  IFetchWeekDayAvailability,
  IUpdateAvailability,
  IUpdateAvailabilityConfig,
} from '../interface/availability.interface';
import { AvailabilityError } from '../error/availability.error';
import { WeekDay } from '../dto/availability.dto';

@Injectable()
export class AvailabilityProvider {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly _db: Database,
    private readonly handler: ErrorHandler,
  ) {}

  async fetchWeekDayAvailability(ctx: IFetchWeekDayAvailability) {
    const { doctorId, weekDay } = ctx;
    try {
      const weekAvailability = await this._db
        .select()
        .from(schema.availability)
        .where(
          and(
            eq(schema.availability.weekDay, weekDay),
            eq(schema.availability.doctorId, doctorId),
          ),
        )
        .limit(1);

      if (!weekAvailability || !weekAvailability.length) {
        return this.handler.handleReturn({
          status: HttpStatus.OK,
          message: ASM.SUCCESS_FETCHING_AVAILABILITY,
          data: [],
        });
      }

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.SUCCESS_FETCHING_AVAILABILITY,
        data: weekAvailability[0],
      });
    } catch (e) {
      this.handler.handleError(e, e.message || AEM.ERROR_FETCHING_AVAILABILITY);
    }
  }

  private async validateDoctor(doctorId: string) {
    try {
      const user = await this._db
        .select({
          role: schema.user.role,
          status: schema.user.status,
        })
        .from(schema.user)
        .where(eq(schema.user.id, doctorId));

      if (!user || !user.length) {
        throw new NotFoundException('User not found');
      }

      if (user[0].role !== USER_ROLE.DOCTOR) {
        throw new ForbiddenException('Only doctors can create availability');
      }

      if (user[0].status === USER_STATUS.SUSPENDED) {
        throw new ForbiddenException('Doctor is suspended');
      }
    } catch (e) {
      throw new AvailabilityError(
        'An error occurred while validating the doctor',
        { cause: e },
      );
    }
  }

  async createAvailability(ctx: ICreateAvailability) {
    const { doctorId, availabilityConfig } = ctx;
    try {
      await this.validateDoctor(doctorId);

      const allWeekDays = Object.values(WeekDay);
      const availabilityMap = new Map(
        availabilityConfig.map((config) => [config.weekDay, config]),
      );

      const fullAvailabilityConfig = allWeekDays.map((day) => {
        const existingConfig = availabilityMap.get(day);
        if (existingConfig) {
          return {
            weekDay: day,
            startTime: existingConfig.startTime,
            endTime: existingConfig.endTime,
          };
        }
        return {
          weekDay: day,
          startTime: '0:00',
          endTime: '0:00',
        };
      });

      await this._db.transaction(async (tx) => {
        await tx.insert(schema.availability).values(
          fullAvailabilityConfig.map((_availability) => ({
            doctorId,
            weekDay: _availability.weekDay,
            startTime: _availability.startTime,
            endTime: _availability.endTime,
          })),
        );
      });

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.SUCCESS_CREATING_AVAILABILITY,
      });
    } catch (e) {
      this.handler.handleError(e, e.message || AEM.ERROR_CREATING_AVAILABILITY);
    }
  }

  async fetchDoctorAvailability(doctorId: string) {
    try {
      await this.validateDoctor(doctorId);

      const availability = await this._db
        .select()
        .from(schema.availability)
        .where(and(eq(schema.availability.doctorId, doctorId)));

      if (!availability || !availability.length) {
        return this.handler.handleReturn({
          status: HttpStatus.OK,
          message: ASM.SUCCESS_FETCHING_AVAILABILITY,
          data: [],
        });
      }

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.SUCCESS_FETCHING_AVAILABILITY,
        data: availability,
      });
    } catch (e) {
      this.handler.handleError(e, e.message || AEM.ERROR_FETCHING_AVAILABILITY);
    }
  }

  async updateDoctorAvailability(ctx: IUpdateAvailability) {
    const { doctorId, availabilityConfig } = ctx;
    try {
      await this.validateDoctor(doctorId);

      let dataToUpdate: IUpdateAvailabilityConfig[] = [];
      dataToUpdate = availabilityConfig
        .map((_availability) => {
          const cleanData: IUpdateAvailabilityConfig = {
            id: _availability.id,
          };

          if (_availability.startTime !== undefined) {
            cleanData.startTime = _availability.startTime;
          }
          if (_availability.endTime !== undefined) {
            cleanData.endTime = _availability.endTime;
          }

          return cleanData;
        })

        .filter(
          (item) => item.startTime !== undefined || item.endTime !== undefined,
        );

      await this._db.transaction(async (tx) => {
        dataToUpdate.forEach(async (item) => {
          await tx
            .update(schema.availability)
            .set(item)
            .where(eq(schema.availability.id, item.id));
        });
      });

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.SUCCESS_UPDATING_AVAILABILITY,
      });
    } catch (e) {
      this.handler.handleError(e, e.message || AEM.ERROR_UPDATING_AVAILABILITY);
    }
  }

  async deleteAvailability(ctx: IDeleteAvailability) {
    try {
      await this.validateDoctor(ctx.doctorId);
      await this._db.transaction(async (tx) => {
        ctx.id.forEach(async (id) => {
          await tx
            .delete(schema.availability)
            .where(eq(schema.availability.id, id));
        });
      });

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.SUCCESS_DELETING_AVAILABILITY,
      });
    } catch (e) {
      return this.handler.handleError(
        e,
        e.message || AEM.ERROR_DELETING_AVAILABILITY,
      );
    }
  }
}
