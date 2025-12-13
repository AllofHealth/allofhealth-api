import { Injectable } from '@nestjs/common';
import { ConsultationProvider } from '../provider/consultation.provider';
import {
  ICreateConsultationType,
  IFindDoctorConsultation,
  IGetDoctorConsultationTypes,
  IUpdateConsultationType,
} from '../interface/consultation.interface';

@Injectable()
export class ConsultationService {
  constructor(private readonly consultationProvider: ConsultationProvider) {}

  async createDoctorConsultationType(ctx: ICreateConsultationType) {
    return await this.consultationProvider.createDoctorConsultationType({
      doctorId: ctx.doctorId,
      consultationTypeId: ctx.consultationTypeId,
      description: ctx.description,
      durationMinutes: ctx.durationMinutes,
      price: ctx.price,
      currency: ctx.currency,
    });
  }

  async getDoctorConsultationTypes(ctx: IGetDoctorConsultationTypes) {
    return await this.consultationProvider.getDoctorConsultationTypes(ctx);
  }

  async updateDoctorConsultationType(ctx: IUpdateConsultationType) {
    return await this.consultationProvider.updateDoctorConsultationType(ctx);
  }

  async findById(ctx: IFindDoctorConsultation) {
    return await this.consultationProvider.findById(ctx);
  }

  async findCalcomEventId(id: number) {
    return await this.consultationProvider.findByCalcomEventTypeId(id);
  }

  async deleteDoctorConsultationType(ctx: IFindDoctorConsultation) {
    return await this.consultationProvider.deleteConsultationType(ctx);
  }

  async addNewConsultationType(name: string) {
    return await this.consultationProvider.addConsultationType(name);
  }

  async fetchAllConsultationTypes() {
    return await this.consultationProvider.fetchAllConsultationTypes();
  }

  async fetchConsultationType(consultationId: string, doctorId: string) {
    return await this.consultationProvider.fetchConsultationType(
      consultationId,
      doctorId,
    );
  }
}
