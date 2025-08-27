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
import {
  EDeleteApproval,
  EResetApprovalPermissions,
} from '@/shared/dtos/event.dto';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';

@Injectable()
export class ApprovalService {
  private readonly logger = new MyLoggerService(ApprovalService.name);
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

  async deleteApproval(ctx: { approvalId: string }) {
    this.logger.debug(`Deleting approval ${ctx.approvalId}`);
    return await this.approvalProvider.deleteApproval(ctx.approvalId);
  }

  @OnEvent(SharedEvents.DELETE_APPROVAL, { async: true })
  async handleDeleteApprovalEvent(ctx: EDeleteApproval) {
    this.logger.debug(`Delete Approval Event emitted`);
    return await this.deleteApproval({ approvalId: ctx.approvalId });
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

  async fetchApprovedApprovals(userId: string) {
    return await this.approvalProvider.fetchApprovedApprovals(userId);
  }

  @OnEvent(SharedEvents.RESET_APPROVAL_PERMISSIONS)
  async resetApprovalPermissions(ctx: EResetApprovalPermissions) {
    return await this.approvalProvider.resetApprovalPermissions(ctx);
  }

  async fetchPendingApprovalCount(doctorId: string) {
    return await this.approvalProvider.fetchDoctorPendingApprovalsCount(
      doctorId,
    );
  }
}
