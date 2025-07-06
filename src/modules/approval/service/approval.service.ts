import { Injectable } from '@nestjs/common';
import { ApprovalProvider } from '../provider/approval.provider';
import { IHandleApproval } from '@/modules/contract/interface/contract.interface';

@Injectable()
export class ApprovalService {
  constructor(private readonly approvalProvider: ApprovalProvider) {}

  async createApproval(ctx: IHandleApproval) {
    return await this.approvalProvider.createApproval(ctx);
  }
}
