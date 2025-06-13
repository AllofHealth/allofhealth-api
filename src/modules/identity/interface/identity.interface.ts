import { TRole } from '@/shared/interface/shared.interface';

export interface IStoreIdentification {
  userId: string;
  governmentId: string;
  scannedLicense?: string;
  role: TRole;
}
