import { TRole } from '@/shared/interface/shared.interface';

export interface IStoreIdentification {
  userId: string;
  governmentFileId?: string;
  governmentId?: string;
  scannedLicenseFileId?: string;
  scannedLicense?: string;
  role: TRole;
}
