import type { TAuthProvider } from '@/modules/user/interface/user.interface';
import type { TRole } from '../interface/shared.interface';

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
  ) {}
}

export class CreateSmartAccount {
  constructor(readonly userId: string) {}
}

export class MintHealthToken {
  constructor(readonly userId: string) {}
}

export class EUpdateTaskCount {
  constructor(readonly userId: string) {}
}

export class BatchMintHealthToken {
  constructor(
    readonly userIds: string[],
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
    readonly governmentIdFilePath: string,
  ) {}
}

export class EHandleRegisterDoctor {
  constructor(
    readonly userId: string,
    readonly governmentIdFilePath: string,
    readonly scannedLicenseFilePath: string,
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
  constructor(readonly email: string) {}
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
