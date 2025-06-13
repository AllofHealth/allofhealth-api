import * as schema from '@/schemas/schema';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { err, ok, ResultAsync } from 'neverthrow';
import { DOCTOR_ERROR_MESSGAES } from '../data/doctor.data';
import { DoctorError } from '../errors/doctor.errors';
import { ICreateDoctor } from '../interface/doctor.interface';

@Injectable()
export class DoctorProvider {
  constructor(@Inject(DRIZZLE_PROVIDER) private readonly db: Database) {}

  fetchDoctor(userId: string) {
    return ResultAsync.fromPromise(
      this.db
        .select()
        .from(schema.doctors)
        .innerJoin(schema.user, eq(schema.doctors.userId, schema.user.id))
        .where(
          and(
            eq(schema.doctors.userId, userId),
            eq(schema.user.role, 'DOCTOR'),
          ),
        )
        .limit(1),
      (error: Error) =>
        new DoctorError(`Error fetching doctor by email: ${error}`),
    ).andThen((doctors) => {
      if (doctors.length === 0) {
        return err(new DoctorError(DOCTOR_ERROR_MESSGAES.DOCTOR_NOT_FOUND));
      }
      return ok(doctors[0].doctors);
    });
  }

  validateDoctorExists(userId: string) {
    return this.fetchDoctor(userId)
      .map(() => true)
      .orElse((error) => {
        if (error.message.includes(DOCTOR_ERROR_MESSGAES.DOCTOR_NOT_FOUND)) {
          return ok(false);
        }

        return err(error);
      });
  }

  createDoctor(ctx: ICreateDoctor) {
    return this.validateDoctorExists(ctx.userId).andThen((doctorExists) => {
      if (doctorExists) {
        return err(
          new DoctorError(DOCTOR_ERROR_MESSGAES.DOCTOR_ALREADY_EXISTS),
        );
      }

      const licenseExpirationDateString = ctx.licenseExpirationDate
        .toISOString()
        .split('T')[0];

      return ResultAsync.fromPromise(
        this.db
          .insert(schema.doctors)
          .values({
            userId: ctx.userId,
            hospitalAssociation: ctx.hospitalAssociation,
            licenseExpirationDate: licenseExpirationDateString,
            locationOfHospital: ctx.locationOfHospital,
            medicalLicenseNumber: ctx.medicalLicenseNumber,
            specialization: ctx.specialization,
            yearsOfExperience: ctx.yearsOfExperience,
            certifications: ctx.certifications,
            languagesSpoken: ctx.languagesSpoken,
          })
          .returning(),
        (error: Error) =>
          new DoctorError(
            `${DOCTOR_ERROR_MESSGAES.ERROR_CREATING_DOCTOR}: ${error.message}`,
          ),
      ).andThen((insertedDoctors) => {
        if (!insertedDoctors[0]) {
          return err(
            new DoctorError(DOCTOR_ERROR_MESSGAES.ERROR_CREATING_DOCTOR),
          );
        }
        return ok(insertedDoctors[0]);
      });
    });
  }
}
