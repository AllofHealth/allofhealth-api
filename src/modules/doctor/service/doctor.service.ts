import { CreateDoctor } from '@/shared/dtos/event.dto';
import { SharedEvents } from '@/shared/events/shared.events';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DoctorProvider } from '../provider/doctor.provider';
import { IFetchDoctors } from '../interface/doctor.interface';

@Injectable()
export class DoctorService {
  constructor(private readonly doctorProvider: DoctorProvider) {}

  @OnEvent(SharedEvents.CREATE_DOCTOR, { async: true })
  async createDoctor(ctx: CreateDoctor) {
    return await this.doctorProvider.createDoctor(ctx);
  }

  async fetchAllDoctors(ctx: IFetchDoctors) {
    return await this.doctorProvider.fetchAllDoctors(ctx);
  }
}
