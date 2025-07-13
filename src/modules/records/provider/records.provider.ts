import { DoctorService } from '@/modules/doctor/service/doctor.service';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  RECORDS_ERROR_MESSAGES as REM,
  RECORDS_SUCCESS_MESSAGES as RSM,
} from '../data/records.data';
import { ICreateRecord } from '../interface/records.interface';
import * as schema from '@/schemas/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class RecordsProvider {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
    private readonly handler: ErrorHandler,
    private readonly doctorService: DoctorService,
  ) {}

  private async returnPractitionerName(practitionerId: string) {
    const doctor = await this.doctorService.fetchDoctor(practitionerId);
    if (!doctor || !('data' in doctor) || typeof doctor === undefined) {
      throw new BadRequestException('Practitioner not found');
    }

    return doctor.data?.fullName;
  }

  async createRecord(ctx: ICreateRecord) {
    const { title, practitionerId, patientId } = ctx;
    try {
      return await this.db.transaction(async (tx) => {
        let lastRecordChainId: number = 0;

        let counter = await tx
          .select()
          .from(schema.userRecordCounters)
          .where(eq(schema.userRecordCounters.userId, patientId))
          .limit(1);

        if (counter.length === 0) {
          await tx.insert(schema.userRecordCounters).values({
            userId: patientId,
            lastRecordChainId: 0,
          });

          lastRecordChainId = 0;
        } else {
          lastRecordChainId = counter[0].lastRecordChainId;
        }

        const nextChainId = lastRecordChainId + 1;

        await tx
          .update(schema.userRecordCounters)
          .set({
            lastRecordChainId: nextChainId,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(schema.userRecordCounters.userId, patientId));

        const name = await this.returnPractitionerName(practitionerId);

        const inserted = await tx
          .insert(schema.records)
          .values({
            userId: patientId,
            recordChainId: nextChainId,
            title: title,
            practitionerName: name!,
          })
          .returning();

        if (!inserted) {
          return this.handler.handleReturn({
            status: HttpStatus.EXPECTATION_FAILED,
            message: REM.ERROR_CREATING_RECORD,
          });
        }

        return this.handler.handleReturn({
          status: HttpStatus.OK,
          message: RSM.SUCCESS_CREATING_RECORD,
        });
      });
    } catch (e) {
      return this.handler.handleError(e, REM.ERROR_CREATING_RECORD);
    }
  }
}
