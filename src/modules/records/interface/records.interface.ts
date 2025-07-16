export interface ICreateRecord {
  title: string;
  practitionerId: string;
  patientId: string;
}

export interface IEncryptRecord {
  clinicalNotes: string[];
  diagnosis: string[];
  labResults?: string[];
  medicationsPrscribed?: string[];
}

export interface IDecryptRecord extends IEncryptRecord {}
