import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { ERegisterEntity } from '@/shared/dtos/event.dto';
import { SharedEvents } from '@/shared/events/shared.events';
import type { ContractProvider } from '../provider/contract.provider';

@Injectable()
export class ContractService {
  constructor(private readonly contractProvider: ContractProvider) {}

  async systemAdminCount() {
    return await this.contractProvider.handleGetSystemAdminCount();
  }

  async getPatientCount() {
    return await this.contractProvider.handleGetPatientCount();
  }

  @OnEvent(SharedEvents.ADD_PATIENT_TO_CONTRACT)
  async registerPatient(ctx: ERegisterEntity) {
    return await this.contractProvider.handleRegisterPatient(ctx.userId);
  }

  @OnEvent(SharedEvents.ADD_DOCTOR_TO_CONTRACT)
  async registerDoctor(ctx: ERegisterEntity) {
    return await this.contractProvider.handleRegisterDoctor(ctx.userId);
  }
}
