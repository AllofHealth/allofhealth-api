import { ApprovalService } from '@/modules/approval/service/approval.service';
import { ContractService } from '@/modules/contract/service/contract.service';
import { DoctorService } from '@/modules/doctor/service/doctor.service';
import { IPFS_ERROR_MESSAGES } from '@/modules/ipfs/data/ipfs.data';
import { IpfsService } from '@/modules/ipfs/service/ipfs.service';
import * as schema from '@/schemas/schema';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { EAddMedicalRecordToContract } from '@/shared/dtos/event.dto';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { SharedEvents } from '@/shared/events/shared.events';
import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { eq, sql } from 'drizzle-orm';
import {
  RECORDS_STATUS,
  RECORDS_ERROR_MESSAGES as REM,
  RECORDS_SUCCESS_MESSAGES as RSM,
} from '../data/records.data';
import {
  ICreateRecord,
  IFetchPatientRecords,
} from '../interface/records.interface';
import { RecordsEncryptionService } from '../service/record-encryption.service';
import { formatDateToStandard } from '@/shared/utils/date.utils';

@Injectable()
export class RecordsProvider {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
    private readonly handler: ErrorHandler,
    private readonly doctorService: DoctorService,
    private readonly recordEncryptionService: RecordsEncryptionService,
    private readonly ipfsService: IpfsService,
    private readonly eventEmitter: EventEmitter2,
    private readonly approvalService: ApprovalService,
    private readonly contractService: ContractService,
  ) {}

  private async returnPractitionerName(practitionerId: string) {
    const doctor = await this.doctorService.fetchDoctor(practitionerId);
    if (!doctor || !('data' in doctor) || typeof doctor === undefined) {
      throw new BadRequestException('Practitioner not found');
    }

    return doctor.data?.fullName;
  }

  async createRecord(ctx: ICreateRecord) {
    const {
      title,
      approvalId,
      practitionerId,
      patientId,
      recordType,
      clinicalNotes,
      diagnosis,
      labResults,
      medicationsPrscribed,
      attachment1,
      attachment2,
      attachment3,
    } = ctx;
    try {
      const practitionerSmartAddress =
        await this.contractService.getPractitionerSmartAddress(practitionerId);

      const isPractitionerApprovedToAccessRecord =
        await this.approvalService.validateIsPractitionerApproved({
          practitionerAddress: practitionerSmartAddress,
          approvalId,
          userId: patientId,
        });

      console.debug(isPractitionerApprovedToAccessRecord);
      const practitionerPermission =
        isPractitionerApprovedToAccessRecord.permissions;
      const allowPermissions = ['write', 'full'];

      if (!allowPermissions.includes(practitionerPermission)) {
        return this.handler.handleReturn({
          status: HttpStatus.FORBIDDEN,
          message: REM.PRACTITIONER_NOT_APPROVED_TO_ACCESS_RECORD,
        });
      }

      // Process attachments
      const attachments: Express.Multer.File[] = [];
      if (attachment1) attachments.push(attachment1);
      if (attachment2) attachments.push(attachment2);
      if (attachment3) attachments.push(attachment3);

      const name = await this.returnPractitionerName(practitionerId);
      if (!name) {
        return this.handler.handleReturn({
          status: HttpStatus.NOT_FOUND,
          message: 'Practitioner not found',
        });
      }

      const encryptedRecordResult =
        await this.recordEncryptionService.encryptMedicalRecord({
          clinicalNotes,
          diagnosis,
          title,
          medicationsPrscribed,
          labResults,
          recordType,
        });

      const encryptedResult = encryptedRecordResult.data;
      if (!encryptedResult) {
        return this.handler.handleReturn({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: REM.ERROR_CREATING_RECORD,
        });
      }

      const dbResult = await this.db.transaction(async (tx) => {
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

        const inserted = await tx
          .insert(schema.records)
          .values({
            userId: patientId,
            recordChainId: nextChainId,
            title: title,
            recordType: recordType,
            practitionerName: name,
            status: RECORDS_STATUS.COMPLETED,
          })
          .returning();

        if (!inserted) {
          throw new Error('Failed to insert record');
        }

        return { recordId: nextChainId };
      });

      if (!dbResult.recordId) {
        throw new Error('Failed to insert record');
      }

      const ipfsResult = await this.ipfsService.uploadRecordToIpfs({
        userId: patientId,
        clinicalNotes: encryptedResult.clinicalNotes,
        title: encryptedResult.title,
        diagnosis: encryptedResult.diagnosis,
        medicationsPrscribed: encryptedResult.medicationsPrscribed,
        labResults: encryptedResult.labResults,
        attachments: attachments,
      });

      if (!('data' in ipfsResult) || !ipfsResult) {
        return this.handler.handleReturn({
          status: ipfsResult.status,
          message: ipfsResult.message,
        });
      }

      const cid = ipfsResult.data;
      if (!cid) {
        return this.handler.handleReturn({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: IPFS_ERROR_MESSAGES.ERROR_UPLOADING_RECORD,
        });
      }

      this.eventEmitter.emit(
        SharedEvents.ADD_MEDICAL_RECORD_TO_CONTRACT,
        new EAddMedicalRecordToContract(
          patientId,
          practitionerId,
          cid,
          approvalId,
        ),
      );

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: RSM.SUCCESS_CREATING_RECORD,
      });
    } catch (e) {
      return this.handler.handleError(e, REM.ERROR_CREATING_RECORD);
    }
  }

  async fetchRecords(ctx: IFetchPatientRecords) {
    const { userId, page = 1, limit = 12 } = ctx;
    const skip = (page - 1) * limit;
    try {
      const totalPatientRecordsResult = await this.db
        .select({ count: sql`count(*)`.as('count') })
        .from(schema.records)
        .where(eq(schema.records.userId, userId));

      const totalCount = Number(totalPatientRecordsResult[0]?.count ?? 0);
      const totalPages = Math.ceil(totalCount / limit);

      const patientRecords = await this.db
        .select({
          id: schema.records.id,
          userId: schema.records.userId,
          title: schema.records.title,
          recordType: schema.records.recordType,
          practitionerName: schema.records.practitionerName,
          status: schema.records.status,
          createdAt: schema.records.createdAt,
        })
        .from(schema.records)
        .where(eq(schema.records.userId, userId))
        .limit(limit)
        .offset(skip);

      if (!patientRecords) {
        return this.handler.handleReturn({
          status: HttpStatus.OK,
          message: RSM.SUCCESS_FETCHING_RECORDS,
          data: [],
          meta: {
            currentPage: page,
            totalPages,
            totalCount,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        });
      }

      const recordSnippet = patientRecords.map((record) => {
        const dateAdded = formatDateToStandard(record.createdAt as string);
        return {
          id: record.id,
          title: record.title,
          recordType: record.recordType,
          practitionerName: record.practitionerName,
          status: record.status,
          createdAt: dateAdded,
        };
      });

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: RSM.SUCCESS_FETCHING_RECORDS,
        data: recordSnippet,
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
      return this.handler.handleError(e, REM.ERROR_FETCHING_RECORDS);
    }
  }
}
