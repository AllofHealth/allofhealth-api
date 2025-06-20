import * as schema from '@/schemas/schema';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import {
  DOCTOR_ERROR_MESSGAES as DEM,
  DOCTOR_SUCCESS_MESSAGES as DSM,
} from '../data/doctor.data';
import { ICreateDoctor, IDoctorSnippet } from '../interface/doctor.interface';

@Injectable()
export class DoctorProvider {
  private handler: ErrorHandler;
  constructor(@Inject(DRIZZLE_PROVIDER) private readonly db: Database) {
    this.handler = new ErrorHandler();
  }

  async fetchDoctor(userId: string) {
    try {
      const doctor = await this.db
        .select()
        .from(schema.doctors)
        .innerJoin(schema.user, eq(schema.doctors.userId, schema.user.id))
        .where(
          and(
            eq(schema.doctors.userId, userId),
            eq(schema.user.role, 'DOCTOR'),
          ),
        )
        .limit(1);

      const parsedDoctor: IDoctorSnippet = {
        userId: doctor[0].users.id,
        fullName: doctor[0].users.fullName,
        email: doctor[0].users.emailAddress,
        gender: doctor[0].users.gender,
        profilePicture: doctor[0].users.profilePicture as string,
        role: doctor[0].users.role,
        certifications: doctor[0].doctors.certifications as string[],
        hospitalAssociation: doctor[0].doctors.hospitalAssociation,
        specialization: doctor[0].doctors.specialization,
        languagesSpoken: doctor[0].doctors.languagesSpoken as string[],
        locationOfHospital: doctor[0].doctors.locationOfHospital,
        medicalLicenseNumber: doctor[0].doctors.medicalLicenseNumber,
        yearsOfExperience: doctor[0].doctors.yearsOfExperience,
      };

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: DSM.DOCTOR_CREATED,
        data: parsedDoctor,
      });
    } catch (e) {
      return this.handler.handleError(e, DEM.ERROR_CREATING_DOCTOR);
    }
  }

  async validateDoctorExists(userId: string) {
    const doctor = await this.fetchDoctor(userId);
    if (doctor.status === HttpStatus.OK) {
      return true;
    }

    return false;
  }

  async createDoctor(ctx: ICreateDoctor) {
    try {
      const doctorExists = await this.validateDoctorExists(ctx.userId);
      if (doctorExists) {
        return this.handler.handleReturn({
          status: HttpStatus.FOUND,
          message: DEM.DOCTOR_ALREADY_EXISTS,
        });
      }

      const licenseExpirationDateString = ctx.licenseExpirationDate
        .toISOString()
        .split('T')[0];

      await this.db.insert(schema.doctors).values({
        userId: ctx.userId,
        hospitalAssociation: ctx.hospitalAssociation,
        licenseExpirationDate: licenseExpirationDateString,
        locationOfHospital: ctx.locationOfHospital,
        medicalLicenseNumber: ctx.medicalLicenseNumber,
        specialization: ctx.specialization,
        yearsOfExperience: ctx.yearsOfExperience,
        certifications: ctx.certifications,
        languagesSpoken: ctx.languagesSpoken,
      });

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: DSM.DOCTOR_CREATED,
      });
    } catch (e) {
      return this.handler.handleError(e, DEM.ERROR_CREATING_DOCTOR);
    }
  }
}
