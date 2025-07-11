import { Injectable } from '@nestjs/common';
import { ApprovalProvider } from '../provider/approval.provider';
import { IHandleApproval } from '@/modules/contract/interface/contract.interface';
import {
  IAcceptApproval,
  IRejectApproval,
} from '../interface/approval.interface';

@Injectable()
export class ApprovalService {
  constructor(private readonly approvalProvider: ApprovalProvider) {}

  async createApproval(ctx: IHandleApproval) {
    return await this.approvalProvider.createApproval(ctx);
  }

  async fetchDoctorApprovals(doctorId: string) {
    return await this.approvalProvider.fetchDoctorApprovals(doctorId);
  }

  async acceptApproval(ctx: IAcceptApproval) {
    return await this.approvalProvider.acceptApproval(ctx);
  }

  async rejectApproval(ctx: IRejectApproval) {
    return await this.approvalProvider.rejectApproval(ctx);
  }
}
