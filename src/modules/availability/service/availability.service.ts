import { Injectable } from '@nestjs/common';
import { AvailabilityProvider } from '../provider/availability.provider';
import {
  ICreateAvailability,
  IDeleteAvailability,
  IUpdateAvailability,
} from '../interface/availability.interface';

@Injectable()
export class AvailabilityService {
  constructor(private readonly availabilityProvider: AvailabilityProvider) {}

  async createAvailability(ctx: ICreateAvailability) {
    return await this.availabilityProvider.createAvailability(ctx);
  }

  async fetchDoctorAvailability(doctorId: string) {
    return await this.availabilityProvider.fetchDoctorAvailability(doctorId);
  }

  async updateDoctorAvailability(ctx: IUpdateAvailability) {
    return await this.availabilityProvider.updateDoctorAvailability(ctx);
  }
  async deleteDoctorAvailability(ctx: IDeleteAvailability) {
    return await this.availabilityProvider.deleteAvailability(ctx);
  }
}
