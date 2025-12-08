import type { TAuthProvider } from '@/modules/user/interface/user.interface';
import type { TRole } from '../interface/shared.interface';
import { TActionTypes } from '@/modules/daily-tasks/interface/daily-tasks.interface';
import { IRewardUsers } from '@/modules/reward/interface/reward.interface';
import { TOperation } from '@/modules/doctor/interface/doctor.interface';
import {
  TBookingEmailContext,
  TEmailContext,
} from '../modules/resend/interface/resend.interface';
import { IdentityContext } from '@/modules/identity/interface/identity.interface';

export class CreateDoctor {
  constructor(
    readonly userId: string,
    readonly specialization: string,
    readonly medicalLicenseNumber: string,
    readonly yearsOfExperience: number,
    readonly hospitalAssociation: string,
    readonly locationOfHospital: string,
    readonly languagesSpoken: string[],
    readonly licenseExpirationDate: Date,
    readonly certifications?: string[],
    readonly servicesOffered?: string[],
    readonly bio?: string,
  ) {}
}

export class DeleteUser {
  constructor(readonly userId: string) {}
}

export class StoreId {
  constructor(
    readonly userId: string,
    readonly role: TRole,
    readonly governmentId?: string,
    readonly governmentFileId?: string,
    readonly scannedLicenseUrl?: string,
    readonly scannedLicenseFileId?: string,
    readonly context?: IdentityContext,
  ) {}
}

export class CreateSmartAccount {
  constructor(
    readonly userId: string,
    readonly rpc?: string,
  ) {}
}

export class MintHealthToken {
  constructor(
    readonly userId: string,
    readonly amount: number,
  ) {}
}

export class EUpdateTaskCount {
  constructor(
    readonly userId: string,
    readonly action: TActionTypes,
    readonly actionId?: string,
  ) {}
}

export class BatchMintHealthToken {
  constructor(
    readonly users: IRewardUsers[],
    readonly batchSize?: number,
    readonly delayBetweenBatches?: number,
    readonly continueOnError?: boolean,
  ) {}
}

export class EUpdateUser {
  constructor(
    readonly userId: string,
    readonly fullName?: string,
    readonly emailAddress?: string,
    readonly dateOfBirth?: Date,
    readonly gender?: string,
    readonly phoneNumber?: string,
    readonly password?: string,
    readonly specialization?: string,
    readonly medicalLicenseNumber?: string,
    readonly hospitalAssociation?: string,
    readonly locationOfHospital?: string,
    readonly lastLogin?: Date,
    readonly lastActivity?: Date,
    readonly authProvider?: TAuthProvider,
  ) {}
}

export class EOnUserLogin {
  constructor(
    readonly userId: string,
    readonly lastLogin?: Date,
    readonly lastActivity?: Date,
    readonly authProvider?: TAuthProvider,
  ) {}
}

export class ERegisterEntity {
  constructor(readonly userId: string) {}
}

export class EHandleRegisterPatient {
  constructor(
    readonly userId: string,

    readonly governmentIdFilePath?: string,
  ) {}
}

export class EHandleRegisterDoctor {
  constructor(
    readonly userId: string,
    readonly scannedLicenseFilePath: string,
    readonly governmentIdFilePath?: string,
  ) {}
}

export class EApproveRecordAccess {
  constructor(
    readonly practitionerId: string,
    readonly userId: string,
    readonly recordId: number,
    readonly duration: number | undefined,
  ) {}
}

export class EApproveWriteRecord {
  constructor(
    readonly doctorId: string,
    readonly userId: string,
  ) {}
}

export class EAddMedicalRecordToContract {
  constructor(
    readonly userId: string,
    readonly practitionerId: string,
    readonly cid: string,
    readonly approvalId: string,
    readonly recordChainId: number,
  ) {}
}

export class EDeleteApproval {
  constructor(readonly approvalId: string) {}
}

export class ESendOtp {
  constructor(
    readonly email: string,
    readonly subject?: string,
    readonly name?: string,
  ) {}
}

export class EValidateOtp {
  constructor(readonly userId: string) {}
}

export class EUpdateMoodMetrics {
  constructor(
    readonly userId: string,
    readonly month?: number,
  ) {}
}

export class EDeleteIpfsRecord {
  constructor(
    readonly userId: string,
    readonly cid: string,
  ) {}
}

export class EResetApprovalPermissions {
  constructor(readonly approvalId: string) {}
}

export class EUpdateReviewCount {
  constructor(
    readonly userId: string,
    readonly op: TOperation,
  ) {}
}

export class ESendEmail {
  constructor(
    readonly to: string,
    readonly body?: string,
    readonly subject?: string,
    readonly name?: string,
    readonly from?: string,
    readonly useHtml?: boolean,
    readonly context?: TEmailContext,
  ) {}
}

export class BookingCreatedEvent {
  constructor(
    readonly to: string,
    readonly patientName: string,
    readonly doctorName: string,
    readonly date: string,
    readonly time: string,
    readonly consultationType: string,
  ) {}
}

export class BookingConfirmedEvent {
  constructor(
    readonly to: string,
    readonly bookingReference: string,
    readonly from?: string,
    readonly doctorName?: string,
    readonly subject?: string,
    readonly patientName?: string,
    readonly date?: string,
    readonly startTime?: string,
    readonly endTime?: string,
    readonly consultationType?: string,
    readonly calendarUrl?: string,
    readonly videoRoomUrl?: string,
    readonly context?: TBookingEmailContext,
  ) {}
}

export class BookingCancelledEvent {
  constructor(
    public readonly bookingId: string,
    public readonly patientId: string,
    public readonly doctorId: string,
    public readonly paymentStatus: string,
    public readonly amount: number,
  ) {}
}

export class BookingCompletedEvent {
  constructor(
    public readonly bookingId: string,
    public readonly patientId: string,
    public readonly doctorId: string,
    public readonly duration: number,
  ) {}
}
