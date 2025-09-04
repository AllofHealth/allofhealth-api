export interface IHandleFileUploads {
  userId?: string;
  files: Express.Multer.File[];
}

export interface IMedicalRecord {
  userId: string;
  title: string;
  clinicalNotes: string[];
  diagnosis: string[];
  labResults?: string[];
  medicationsPrscribed?: string[];
  attachments?: Express.Multer.File[];
}

/**
 * @dev Medications prescribed is added twice intentionally. previous records might still have that field in typo. but newer records should have the issue fixed
 */
export interface IpfsRecord {
  userId: string;
  title: string;
  clinicalNotes: string[];
  diagnosis: string[];
  labResults?: string[];
  medicationsPrscribed?: string[];
  medicationsPrescribed?: string[];
  attachments?: string[];
  uploadedAt: string;
}

export interface IDeleteRecordFromIpfs {
  userId: string;
  cid: string;
}

export interface IFindPathFromCid {
  userId: string;
  cid: string;
}
