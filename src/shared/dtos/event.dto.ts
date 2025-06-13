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
    readonly governmentId: string,
    readonly role: TRole,
    readonly scannedLicenseUrl?: string,
  ) {}
}
