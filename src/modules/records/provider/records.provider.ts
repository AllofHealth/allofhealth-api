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
import { eq } from 'drizzle-orm';
import {
  RECORDS_ERROR_MESSAGES as REM,
  RECORDS_SUCCESS_MESSAGES as RSM,
} from '../data/records.data';
import { ICreateRecord } from '../interface/records.interface';
import { RecordsEncryptionService } from '../service/record-encryption.service';

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

      if (
        (!isPractitionerApprovedToAccessRecord.isApproved &&
          isPractitionerApprovedToAccessRecord.permissions !== 'write') ||
        isPractitionerApprovedToAccessRecord.permissions !== 'full'
      ) {
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
            practitionerName: name,
          })
          .returning();

        if (!inserted) {
          throw new Error('Failed to insert record');
        }

        return { recordId: nextChainId };
      });

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
        new EAddMedicalRecordToContract(patientId, practitionerId, cid),
      );

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: RSM.SUCCESS_CREATING_RECORD,
      });
    } catch (e) {
      return this.handler.handleError(e, REM.ERROR_CREATING_RECORD);
    }
  }
}
