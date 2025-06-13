import { Injectable } from '@nestjs/common';
import { DoctorProvider } from '../provider/doctor.provider';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { ICreateDoctor } from '../interface/doctor.interface';
import { DOCTOR_SUCCESS_MESSAGES } from '../data/doctor.data';

@Injectable()
export class DoctorService {
  private errorHandler: ErrorHandler;
  constructor(private readonly doctorProvider: DoctorProvider) {
    this.errorHandler = new ErrorHandler();
  }

  async createDoctor(ctx: ICreateDoctor) {
    const result = this.doctorProvider.createDoctor(ctx);
    return await this.errorHandler.handleResult(
      result,
      DOCTOR_SUCCESS_MESSAGES.DOCTOR_CREATED,
    );
  }
}
