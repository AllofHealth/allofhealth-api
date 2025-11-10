import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
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
  CALENDAR_ERROR_MESSAGE as CEM,
  CALENDAR_SUCCESS_MESSAGE as CSM,
} from '../data/calendar.data';
import {
  IFindIntegrationByDoctorId,
  IUpsertCalendarIntegration,
} from '../interface/calendar.interface';
import * as schema from '@/schemas/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class CalendarProvider {
  private readonly logger = new MyLoggerService(CalendarProvider.name);
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly _db: Database,
    private readonly handler: ErrorHandler,
  ) {}

  async upsertCalendarIntegration(ctx: IUpsertCalendarIntegration) {
    const {
      accessToken,
      doctorId,
      provider = 'calcom',
      expiresAt,
      providerEmail,
      providerUserId,
      refreshToken,
    } = ctx;
    try {
      const [existingIntegration] = await this._db
        .select()
        .from(schema.doctorCalendarIntegrations)
        .where(eq(schema.doctorCalendarIntegrations.doctorId, doctorId))
        .limit(1);

      let message = CSM.INTEGRATION_CREATED;
      if (existingIntegration) {
        message = CSM.INTEGRATION_UPDATED;
      }

      const [result] = await this._db
        .insert(schema.doctorCalendarIntegrations)
        .values({
          doctorId,
          provider,
          accessToken,
          expiresAt,
          providerEmail,
          providerUserId,
          refreshToken,
        })
        .onConflictDoUpdate({
          target: schema.doctorCalendarIntegrations.doctorId,
          set: {
            accessToken,
            expiresAt,
            providerEmail,
            providerUserId,
            refreshToken,
            updatedAt: new Date(),
          },
        })
        .returning();

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message,
        data: result,
      });
    } catch (e) {
      this.handler.handleError(e, e.message || CEM.ERROR_UPDATING_INTEGRATION);
    }
  }

  async findIntegrationByDoctorId(ctx: IFindIntegrationByDoctorId) {
    const { doctorId, provider = 'calcom' } = ctx;
    try {
      const [integration] = await this._db
        .select()
        .from(schema.doctorCalendarIntegrations)
        .where(eq(schema.doctorCalendarIntegrations.doctorId, doctorId))
        .limit(1);

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: CSM.INTEGRATION_FOUND,
        data: integration,
      });
    } catch (e) {
      this.handler.handleError(e, e.message || CEM.INTEGRATION_NOT_FOUND);
    }
  }

  async hasActiveIntegration(doctorId: string) {
    try {
      const integration = await this.findIntegrationByDoctorId({
        doctorId,
      });

      if (!integration || !integration.data) {
        throw new NotFoundException(CEM.INTEGRATION_NOT_FOUND);
      }

      return integration.data.isActive ?? false;
    } catch (e) {
      this.handler.handleError(
        e,
        e.message || CEM.ERROR_VALIDATING_INTEGRATION,
      );
    }
  }

  async deactivateIntegration(integrationId: string) {
    try {
      await this._db
        .update(schema.doctorCalendarIntegrations)
        .set({ isActive: false })
        .where(eq(schema.doctorCalendarIntegrations.id, integrationId));

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: CSM.INTEGRATION_DEACTIVATED,
      });
    } catch (e) {
      this.handler.handleError(
        e,
        e.message || CEM.ERROR_DEACTIVATING_INTEGRATION,
      );
    }
  }

  async updateLastSync(integrationId: string) {
    try {
      await this._db
        .update(schema.doctorCalendarIntegrations)
        .set({ lastSyncAt: new Date() })
        .where(eq(schema.doctorCalendarIntegrations.id, integrationId));

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: CSM.INTEGRATION_LAST_SYNC_UPDATED,
      });
    } catch (e) {
      this.handler.handleError(e, e.message || CEM.ERROR_UPDATING_INTEGRATION);
    }
  }
}
