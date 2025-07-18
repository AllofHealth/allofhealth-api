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

export interface IpfsRecord {
  userId: string;
  title: string;
  clinicalNotes: string[];
  diagnosis: string[];
  labResults?: string[];
  medicationsPrscribed?: string[];
  attachments?: string[];
  uploadedAt: string;
}
