import { CreateDoctor } from '@/shared/dtos/event.dto';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { SharedEvents } from '@/shared/events/shared.events';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DOCTOR_SUCCESS_MESSAGES } from '../data/doctor.data';
import { DoctorProvider } from '../provider/doctor.provider';

@Injectable()
export class DoctorService {
  private errorHandler: ErrorHandler;
  constructor(private readonly doctorProvider: DoctorProvider) {
    this.errorHandler = new ErrorHandler();
  }

  @OnEvent(SharedEvents.CREATE_DOCTOR, { async: true })
  async createDoctor(ctx: CreateDoctor) {
    const result = this.doctorProvider.createDoctor(ctx);
    return await this.errorHandler.handleResult(
      result,
      DOCTOR_SUCCESS_MESSAGES.DOCTOR_CREATED,
    );
  }
}
