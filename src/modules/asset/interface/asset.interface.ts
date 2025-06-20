import { TRole } from '@/shared/interface/shared.interface';

export enum TUploadContext {
  GOVERNMENT_ID = 'government-id',
  SCANNED = 'scanned-license',
}

export interface IUploadIdentityFile {
  userId: string;
  governmentIdFilePath?: string;
  scannedLicenseFilePath?: string;
  role: TRole;
}

export interface IHandleImageKitUpload {
  userId: string;
  folderPath: string;
  fileBuffer: NonSharedBuffer;
  uploadContext: TUploadContext;
}
