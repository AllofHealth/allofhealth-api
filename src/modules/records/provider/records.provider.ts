import { ApprovalService } from '@/modules/approval/service/approval.service';
import { ContractService } from '@/modules/contract/service/contract.service';
import { DoctorService } from '@/modules/doctor/service/doctor.service';
import { IPFS_ERROR_MESSAGES } from '@/modules/ipfs/data/ipfs.data';
import { IpfsService } from '@/modules/ipfs/service/ipfs.service';
import * as schema from '@/schemas/schema';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import {
  EAddMedicalRecordToContract,
  EDeleteApproval,
} from '@/shared/dtos/event.dto';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { SharedEvents } from '@/shared/events/shared.events';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { and, eq, sql } from 'drizzle-orm';
import {
  RECORDS_STATUS,
  RECORDS_ERROR_MESSAGES as REM,
  RECORDS_SUCCESS_MESSAGES as RSM,
} from '../data/records.data';
import {
  ICreateRecord,
  IfetchAndDecrypt,
  IFetchPatientRecords,
  IFetchRecordById,
} from '../interface/records.interface';
import { RecordsEncryptionService } from '../service/record-encryption.service';
import {
  formatDateToReadable,
  formatDateToStandard,
} from '@/shared/utils/date.utils';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { IpfsRecord } from '@/modules/ipfs/interface/ipfs.interface';
import { CreateRecordQueue } from '@/shared/queues/records/records.queue';

@Injectable()
export class RecordsProvider {
  private readonly logger = new MyLoggerService(RecordsProvider.name);
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
    private readonly handler: ErrorHandler,
    private readonly doctorService: DoctorService,
    private readonly recordEncryptionService: RecordsEncryptionService,
    private readonly ipfsService: IpfsService,
    private readonly eventEmitter: EventEmitter2,
    private readonly approvalService: ApprovalService,
    private readonly contractService: ContractService,
    private readonly createRecordQueue: CreateRecordQueue,
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

      const recordEvent = new EAddMedicalRecordToContract(
        patientId,
        practitionerId,
        cid,
        approvalId,
        dbResult.recordId,
      );

      await this.createRecordQueue.createRecordJob(recordEvent);

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: RSM.SUCCESS_CREATING_RECORD,
      });
    } catch (e) {
      return this.handler.handleError(e, REM.ERROR_CREATING_RECORD);
    }
  }

  async rollbackRecordCreation(ctx: { userId: string; recordChainId: number }) {
    const { userId, recordChainId } = ctx;

    try {
      const result = await this.db.transaction(async (tx) => {
        const recordToDelete = await tx
          .select()
          .from(schema.records)
          .where(
            and(
              eq(schema.records.userId, userId),
              eq(schema.records.recordChainId, recordChainId),
            ),
          )
          .limit(1);

        if (recordToDelete.length === 0) {
          throw new Error(
            `Record with chainId ${recordChainId} not found for user ${userId}`,
          );
        }

        await tx
          .delete(schema.records)
          .where(
            and(
              eq(schema.records.userId, userId),
              eq(schema.records.recordChainId, recordChainId),
            ),
          );

        const counter = await tx
          .select()
          .from(schema.userRecordCounters)
          .where(eq(schema.userRecordCounters.userId, userId))
          .limit(1);

        if (counter.length === 0) {
          throw new Error(`Counter not found for user ${userId}`);
        }

        const currentChainId = counter[0].lastRecordChainId;

        if (currentChainId === recordChainId) {
          await tx
            .update(schema.userRecordCounters)
            .set({
              lastRecordChainId: recordChainId - 1,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(schema.userRecordCounters.userId, userId));

          this.logger.log(
            `Rolled back chain ID from ${recordChainId} to ${recordChainId - 1} for user ${userId}`,
          );
        } else {
          this.logger.warn(
            `Record ${recordChainId} deleted but chain ID not rolled back. Current chain ID is ${currentChainId}`,
          );
        }

        return {
          success: true,
          deletedRecordChainId: recordChainId,
          rolledBackChainId: currentChainId === recordChainId,
        };
      });

      return result;
    } catch (error) {
      this.logger.error(`Error rolling back record creation: ${error.message}`);
      throw error;
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
          recordChainId: schema.records.recordChainId,
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
          recordChainId: record.recordChainId,
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

  private async fetchUriAndDecrypt(ctx: IfetchAndDecrypt) {
    const { userId, recordIds, viewerAddress } = ctx;
    try {
      const recordUriResult = await this.contractService.fetchRecordURIS({
        recordIds,
        userId,
        viewerAddress,
      });

      if (!('data' in recordUriResult && recordUriResult)) {
        throw new HttpException(
          'Failed to fetch record URIs',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const recordUris = recordUriResult.data;
      if (recordUris && recordUris.length > 0) {
        const decryptedRecords = await Promise.all(
          recordUris.map(async (uri) => {
            const encryptedRecord =
              await this.ipfsService.fetchRecordFromIpfs(uri);

            const isIpfsRecord = (record: any): record is IpfsRecord => {
              return (
                record &&
                typeof record === 'object' &&
                'userId' in record &&
                'title' in record &&
                'clinicalNotes' in record &&
                'diagnosis' in record &&
                'uploadedAt' in record
              );
            };

            if (isIpfsRecord(encryptedRecord)) {
              const decryptedRecord =
                await this.recordEncryptionService.decryptMedicalRecord({
                  title: encryptedRecord.title,
                  clinicalNotes: encryptedRecord.clinicalNotes,
                  diagnosis: encryptedRecord.diagnosis,
                  labResults: encryptedRecord.labResults,
                  medicationsPrscribed: encryptedRecord.medicationsPrscribed,
                });

              const recordData = {
                title: decryptedRecord.data?.title,
                clinicalNotes: decryptedRecord.data?.clinicalNotes,
                diagnosis: decryptedRecord.data?.diagnosis,
                labResults: decryptedRecord.data?.labResults,
                medicationsPrscribed:
                  decryptedRecord.data?.medicationsPrscribed,
                attachments: encryptedRecord.attachments,
              };

              return {
                ...recordData,
                uploadedAt: formatDateToReadable(encryptedRecord.uploadedAt),
              };
            }
          }),
        );
        return decryptedRecords;
      }
    } catch (e) {
      throw new HttpException(
        'Failed to fetch record URIs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async fetchRecordByChainId(ctx: IFetchRecordById) {
    const { patientId, practitionerId, recordChainId } = ctx;
    let viewerAddress: string | undefined = undefined;
    try {
      if (practitionerId) {
        const practitionerAddress =
          await this.contractService.getPractitionerSmartAddress(
            practitionerId,
          );

        const approval = await this.db
          .select({
            createdAt: schema.approvals.createdAt,
            duration: schema.approvals.duration,
            approvalId: schema.approvals.id,
            isRequestAccepted: schema.approvals.isRequestAccepted,
            accessLevel: schema.approvals.accessLevel,
          })
          .from(schema.approvals)
          .where(
            and(
              eq(schema.approvals.userId, patientId),
              eq(schema.approvals.practitionerAddress, practitionerAddress),
              eq(schema.approvals.recordId, recordChainId),
            ),
          )
          .limit(1);

        if (!approval || approval.length === 0) {
          throw new UnauthorizedException('Practitioner not authorized');
        }
        const approvalDetails = approval[0];
        const isValid = this.approvalService.validateApprovalDuration({
          createdAt: approvalDetails.createdAt,
          duration: approvalDetails.duration as number,
        });
        const readPermissions = ['read', 'full'];
        if (
          !approvalDetails.isRequestAccepted ||
          !readPermissions.includes(approvalDetails.accessLevel.toLowerCase())
        ) {
          return this.handler.handleReturn({
            status: HttpStatus.UNAUTHORIZED,
            message: 'Invalid permissions',
          });
        }

        if (!isValid) {
          this.eventEmitter.emit(
            SharedEvents.DELETE_APPROVAL,
            new EDeleteApproval(approvalDetails.approvalId),
          );

          return this.handler.handleReturn({
            status: HttpStatus.CONFLICT,
            message: 'Approval duration expired, deleting approval',
            data: approvalDetails.approvalId,
          });
        }
      }

      const patientRecordType = await this.db
        .select({
          recordType: schema.records.recordType,
          practitionerName: schema.records.practitionerName,
        })
        .from(schema.records)
        .where(
          and(
            eq(schema.records.userId, patientId),
            eq(schema.records.recordChainId, recordChainId),
          ),
        );
      const recordType = patientRecordType[0].recordType;

      const decryptedRecord = await this.fetchUriAndDecrypt({
        recordIds: [recordChainId],
        userId: patientId,
        viewerAddress,
      });

      if (!decryptedRecord) {
        throw new HttpException(
          'Failed to decrypt record',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const record = decryptedRecord[0];
      if (!record) {
        throw new HttpException(
          'Failed to fetch record',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const enrichedRecord = {
        ...record,
        recordType: recordType,
        practitionerName: patientRecordType[0].practitionerName,
      };

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: RSM.RECORD_FETCHED_SUCCESSFULLY,
        data: enrichedRecord,
      });
    } catch (e) {
      return this.handler.handleError(e, REM.ERROR_FETCHING_RECORDS);
    }
  }
}
