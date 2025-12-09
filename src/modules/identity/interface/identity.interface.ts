import type { TRole } from '@/shared/interface/shared.interface';
export type IdentityContext = 'register' | 'update';

export interface IStoreIdentification {
  userId: string;
  governmentFileId?: string;
  governmentId?: string;
  scannedLicenseFileId?: string;
  scannedLicense?: string;
  role: TRole;
  context?: IdentityContext;
}

export interface IUpdateDoctorIdentity {
  userId: string;
  governmentFileId?: string;
  governmentId?: string;
  scannedLicenseFileId?: string;
  scannedLicense?: string;
}
