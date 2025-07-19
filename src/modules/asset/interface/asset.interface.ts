import type { TRole } from '@/shared/interface/shared.interface';

export enum TUploadContext {
  GOVERNMENT_ID = 'government-id',
  SCANNED = 'scanned-license',
  PROFILE_PICTURE = 'profile-picture',
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
  uploadContext: string;
}

export interface IUploadProfilePicture {
  userId: string;
  profilePictureFilePath: string;
  context?: string;
}
