import { IHandleApproval } from '@/modules/contract/interface/contract.interface';
import { Injectable } from '@nestjs/common';
import {
  IAcceptApproval,
  IRejectApproval,
  IValidatePractitionerIsApproved,
} from '../interface/approval.interface';
import { ApprovalProvider } from '../provider/approval.provider';
import { ApprovalCleanupService } from '../tasks/approval-cleanup.service';

@Injectable()
export class ApprovalService {
  constructor(
    private readonly approvalProvider: ApprovalProvider,
    private readonly approvalCleanupService: ApprovalCleanupService,
  ) {}

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

  async manualCleanup() {
    return await this.approvalCleanupService.manualCleanup();
  }

  async validateIsPractitionerApproved(ctx: IValidatePractitionerIsApproved) {
    return await this.approvalProvider.validatePractitionerIsApproved(ctx);
  }
}
