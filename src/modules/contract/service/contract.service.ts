import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  EAddMedicalRecordToContract,
  ERegisterEntity,
} from '@/shared/dtos/event.dto';
import { SharedEvents } from '@/shared/events/shared.events';
import { ContractProvider } from '../provider/contract.provider';
import {
  IHandleAddMedicalRecord,
  IHandleApproval,
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

  async mintHealthTokens(userId) {
    return await this.contractProvider.handleMint(userId);
  }

  async fetchTokenBalance(userId) {
    return await this.contractProvider.handleFetchTokenBalance(userId);
  }
}
