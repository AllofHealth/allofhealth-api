export type TAccess = 'full' | 'read' | 'write';

export interface IHandleApproveAccessToAddNewRecord {
  userId: string;
  doctorId: string;
}

export interface IApprovedToAddNewRecord {
  patientId: number;
  doctorAddress: string;
}

export interface IApproveRecordAccess {
  practitionerId: string;
  userId: string;
  recordId: number;
  duration: number;
}

export interface IViewerHasAccessToRecords {
  practitionerAddress: string;
  patientId: number;
  recordId: number;
}

export interface IApproveRecordAccessTx {
  practitionerAddress: string;
  patientChainId: number;
  recordChainId: number;
  duration?: number;
}

export interface IHandleApproval {
  userId: string;
  practitionerId: string;
  recordIds?: number[];
  duration?: number;
  accessLevel: TAccess;
  shareHealthInfo?: boolean;
}

export interface IAddMedicalRecordTx {
  doctorAddress: string;
  patientAddress: string;
  patientChainId: number;
  cid: string;
}

export interface IHandleAddMedicalRecord {
  userId: string;
  practitionerId: string;
  cid: string;
  approvalId: string;
}

export interface IViewMedicalRecord {
  userId: string;
  recordId: number;
  viewerAddress: string;
}
