export interface ICreateRecord extends IEncryptRecord {
  practitionerId: string;
  patientId: string;
  attachment1?: File;
  attachment2?: File;
  attachment3?: File;
}

export interface IEncryptRecord {
  title: string;
  clinicalNotes: string[];
  diagnosis: string[];
  labResults?: string[];
  medicationsPrscribed?: string[];
}

export interface IDecryptRecord extends IEncryptRecord {}
