import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CreateDoctor } from '@/shared/dtos/event.dto';
import { SharedEvents } from '@/shared/events/shared.events';
import {
  IFetchDoctors,
  IUpdateRecordsReviewed,
} from '../interface/doctor.interface';
import { DoctorProvider } from '../provider/doctor.provider';

@Injectable()
export class DoctorService {
  constructor(private readonly doctorProvider: DoctorProvider) {}

  @OnEvent(SharedEvents.CREATE_DOCTOR, { async: true })
  async createDoctor(ctx: CreateDoctor) {
    return await this.doctorProvider.createDoctor(ctx);
  }

  async fetchDoctor(userId: string) {
    return await this.doctorProvider.fetchDoctor(userId);
  }

  async fetchAllDoctors(ctx: IFetchDoctors) {
    return await this.doctorProvider.fetchAllDoctors(ctx);
  }

  async updateRecordsReviewed(ctx: IUpdateRecordsReviewed) {
    return await this.doctorProvider.updateRecordsReviewed(ctx);
  }
}
