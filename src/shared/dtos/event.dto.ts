import { TAuthProvider } from '@/modules/user/interface/user.interface';
import { TRole } from '../interface/shared.interface';

export class CreateDoctor {
  constructor(
    readonly userId: string,
    readonly specialization: string,
    readonly medicalLicenseNumber: string,
    readonly scannedLicenseUrl: string,
    readonly yearsOfExperience: number,
    readonly certifications: string[],
    readonly hospitalAssociation: string,
    readonly locationOfHospital: string,
    readonly languagesSpoken: string[],
    readonly licenseExpirationDate: Date,
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
