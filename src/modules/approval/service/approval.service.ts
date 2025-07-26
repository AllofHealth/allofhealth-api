import { IHandleApproval } from '@/modules/contract/interface/contract.interface';
import { Injectable } from '@nestjs/common';
import {
  IAcceptApproval,
  IFetchPatientApprovals,
  IRejectApproval,
  IValidateApprovalDuration,
  IValidatePractitionerIsApproved,
} from '../interface/approval.interface';
import { ApprovalProvider } from '../provider/approval.provider';
import { ApprovalCleanupService } from '../tasks/approval-cleanup.service';
import { OnEvent } from '@nestjs/event-emitter';
import { SharedEvents } from '@/shared/events/shared.events';
import { EDeleteApproval } from '@/shared/dtos/event.dto';

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

  async findApprovalById(approvalId: string) {
    return await this.approvalProvider.findApprovalById(approvalId);
  }

  @OnEvent(SharedEvents.DELETE_APPROVAL)
  async deleteApproval(ctx: EDeleteApproval) {
    return await this.approvalProvider.deleteApproval(ctx.approvalId);
  }

  async fetchApproval(approvalId: string) {
    return await this.approvalProvider.fetchApproval(approvalId);
  }

  async fetchPatientApprovals(ctx: IFetchPatientApprovals) {
    return await this.approvalProvider.fetchPatientApprovals(ctx);
  }

  validateApprovalDuration(ctx: IValidateApprovalDuration) {
    return this.approvalProvider.validateApprovalDuration(ctx);
  }
}
