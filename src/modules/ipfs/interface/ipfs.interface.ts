export interface IHandleFileUploads {
  userId?: string;
  files: File[];
}

export interface IMedicalRecord {
  userId: string;
  title: string;
  clinicalNotes: string[];
  diagnosis: string[];
  labResults?: string[];
  medicationsPrscribed?: string[];
  attachments?: File[];
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
