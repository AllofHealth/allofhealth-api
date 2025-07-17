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
