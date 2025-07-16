export interface IAcceptApproval {
  doctorId: string;
  approvalId: string;
}

export interface IRejectApproval extends IAcceptApproval {}
