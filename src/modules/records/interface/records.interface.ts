export interface ICreateRecord extends IEncryptRecord {
  title: string;
  practitionerId: string;
  patientId: string;
  attachment1?: File;
  attachment2?: File;
  attachment3?: File;
}

export interface IEncryptRecord {
  clinicalNotes: string[];
  diagnosis: string[];
  labResults?: string[];
  medicationsPrscribed?: string[];
}

export interface IDecryptRecord extends IEncryptRecord {}
