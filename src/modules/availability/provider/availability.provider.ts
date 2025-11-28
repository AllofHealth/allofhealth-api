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
import { eq } from 'drizzle-orm';
import {
  AVAILABILITY_ERROR_MESSAGE as AEM,
  AVAILABILITY_SUCCESS_MESSAGE as ASM,
} from '../data/availability.data';
import { ICreateAvailability } from '../interface/availability.interface';

@Injectable()
export class AvailabilityProvider {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly _db: Database,
    private readonly handler: ErrorHandler,
  ) {}

  async createAvailability(ctx: ICreateAvailability) {
    const { doctorId, availabilityConfig } = ctx;
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

      await this._db.transaction(async (tx) => {
        await tx.insert(schema.availability).values(
          availabilityConfig.map((_availability) => ({
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
}
