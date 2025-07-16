export interface ICreateRecord extends IEncryptRecord {
  practitionerId: string;
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
