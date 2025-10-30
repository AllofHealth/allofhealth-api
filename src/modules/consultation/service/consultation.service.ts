import { Injectable } from '@nestjs/common';
import { ConsultationProvider } from '../provider/consultation.provider';
import {
  ICreateConsultationType,
  IGetDoctorConsultationTypes,
  IUpdateConsultationType,
} from '../interface/consultation.interface';

@Injectable()
export class ConsultationService {
  constructor(private readonly consultationProvider: ConsultationProvider) {}

  async createConsultationType(ctx: ICreateConsultationType) {
    return await this.consultationProvider.createConsultationType(ctx);
  }

  async getDoctorConsultationTypes(ctx: IGetDoctorConsultationTypes) {
    return await this.consultationProvider.getDoctorConsultationTypes(ctx);
  }

  async updateConsultationType(ctx: IUpdateConsultationType) {
    return await this.consultationProvider.updateConsultationType(ctx);
  }

  async findById(id: string) {
    return await this.consultationProvider.findById(id);
  }

  async findCalcomEventId(id: number) {
    return await this.consultationProvider.findByCalcomEventTypeId(id);
  }

  async deleteConsultationType(id: string) {
    return await this.consultationProvider.deleteConsultationType(id);
  }
}
