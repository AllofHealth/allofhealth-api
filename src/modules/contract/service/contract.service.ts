import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  EAddMedicalRecordToContract,
  ERegisterEntity,
  MintHealthToken,
} from '@/shared/dtos/event.dto';
import { SharedEvents } from '@/shared/events/shared.events';
import { ContractProvider } from '../provider/contract.provider';
import {
  IApprovedToAddNewRecord,
  IHandleAddMedicalRecord,
  IHandleApproval,
  IProcessBatchViewMedicalRecord,
  IViewerHasAccessToRecords,
  IViewMedicalRecord,
} from '../interface/contract.interface';

@Injectable()
export class ContractService {
  constructor(private readonly contractProvider: ContractProvider) {}

  async systemAdminCount() {
    return await this.contractProvider.handleGetSystemAdminCount();
  }

  async getPatientCount() {
    return await this.contractProvider.handleGetPatientCount();
  }

  async getPatientContractId(patientAddress: string) {
    return await this.contractProvider.handleGetPatientId(patientAddress);
  }

  @OnEvent(SharedEvents.ADD_PATIENT_TO_CONTRACT)
  async registerPatient(ctx: ERegisterEntity) {
    return await this.contractProvider.handleRegisterPatient(ctx.userId);
  }

  @OnEvent(SharedEvents.ADD_DOCTOR_TO_CONTRACT)
  async registerDoctor(ctx: ERegisterEntity) {
    return await this.contractProvider.handleRegisterDoctor(ctx.userId);
  }

  async handleRecordApproval(ctx: IHandleApproval) {
    return await this.contractProvider.handleRecordApproval(ctx);
  }

  @OnEvent(SharedEvents.ADD_MEDICAL_RECORD_TO_CONTRACT)
  async addMedicalRecordToContract(ctx: EAddMedicalRecordToContract) {
    return await this.contractProvider.handleAddMedicalRecord(ctx);
  }

  async getPractitionerSmartAddress(practitionerId: string) {
    return await this.contractProvider.getPractitionerSmartAddress(
      practitionerId,
    );
  }

  async getPatientSmartAddress(patientId: string) {
    return await this.contractProvider.getPatientSmartAddress(patientId);
  }

  @OnEvent(SharedEvents.MINT_HEALTH_TOKEN, { async: true })
  async mintHealthTokens(ctx: MintHealthToken) {
    return await this.contractProvider.handleMint(ctx.userId);
  }

  async fetchTokenBalance(userId: string) {
    return await this.contractProvider.handleFetchTokenBalance(userId);
  }
  async isApprovedToAddNewRecord(ctx: IApprovedToAddNewRecord) {
    return await this.contractProvider.isApprovedToAddNewRecord(ctx);
  }

  async viewMedicalRecord(ctx: IViewMedicalRecord) {
    return this.contractProvider.viewMedicalRecord(ctx);
  }

  async fetchRecordURIS(ctx: IProcessBatchViewMedicalRecord) {
    return await this.contractProvider.processBatchViewMedicalRecord(ctx);
  }

  async practitionerHasAccessToRecord(ctx: IViewerHasAccessToRecords) {
    return await this.contractProvider.practitonerHasAccessToRecords(ctx);
  }
}
