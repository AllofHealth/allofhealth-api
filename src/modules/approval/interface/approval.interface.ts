export type TApprovalStatus =
  | 'CREATED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'PENDING';

export interface IAcceptApproval {
  doctorId: string;
  approvalId: string;
}

export interface IRejectApproval extends IAcceptApproval {}

export interface IValidateApprovalDuration {
  createdAt: string;
  duration: number;
}

export interface IValidatePractitionerIsApproved {
  userId: string;
  approvalId: string;
  practitionerAddress: string;
  recordId?: number;
}

export interface IFetchPatientApprovals {
  userId: string;
  page?: number;
  limit?: number;
  status?: TApprovalStatus;
}

export interface IFetchDoctorApprovals {
  userId: string;
  page?: number;
  limit?: number;
  status?: TApprovalStatus;
}

export interface IResetApprovalPermissions {
  approvalId: string;
}
