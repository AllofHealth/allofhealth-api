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
    const slug = ctx.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    return await this.consultationProvider.createConsultationType({
      slug,
      doctorId: ctx.doctorId,
      name: ctx.name,
      description: ctx.description,
      durationMinutes: ctx.durationMinutes,
      price: ctx.price,
      currency: ctx.currency,
      calcomEventTypeId: ctx.calcomEventTypeId,
    });
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
