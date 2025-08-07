export interface ICreateRecord extends IEncryptRecord {
  approvalId: string;
  practitionerId: string;
  recordType: string[];
  patientId: string;
  attachment1?: Express.Multer.File;
  attachment2?: Express.Multer.File;
  attachment3?: Express.Multer.File;
}

export interface IEncryptRecord {
  title: string;
  clinicalNotes: string[];
  diagnosis: string[];
  labResults?: string[];
  medicationsPrscribed?: string[];
}

export interface IDecryptRecord extends IEncryptRecord {}

export interface IFetchPatientRecords {
  userId: string;
  page?: number;
  limit?: number;
}

export interface IfetchAndDecrypt {
  userId: string;
  recordIds: number[];
  viewerAddress?: string;
}

export interface IFetchRecordById {
  patientId: string;
  practitionerId?: string;
  recordChainId: number;
}
