import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import * as schema from '@/schemas/schema';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import {
  DOCTOR_ERROR_MESSGAES as DEM,
  DOCTOR_SUCCESS_MESSAGES as DSM,
} from '../data/doctor.data';
import {
  ICreateDoctor,
  IDoctorSnippet,
  IFetchDoctors,
} from '../interface/doctor.interface';

@Injectable()
export class DoctorProvider {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
    private readonly handler: ErrorHandler,
  ) {}

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

      if (!doctor || doctor.length === 0) {
        return this.handler.handleReturn({
          status: HttpStatus.NOT_FOUND,
          message: DEM.DOCTOR_NOT_FOUND,
        });
      }

      const parsedDoctor: IDoctorSnippet = {
        userId: doctor[0].users.id,
        fullName: doctor[0].users.fullName,
        email: doctor[0].users.emailAddress,
        gender: doctor[0].users.gender,
        profilePicture: doctor[0].users.profilePicture as string,
        role: doctor[0].users.role,
        bio: doctor[0].doctors.bio || '',
        servicesOffered: doctor[0].doctors.servicesOffered as string[],
        certifications: doctor[0].doctors.certifications as string[],
        hospitalAssociation: doctor[0].doctors.hospitalAssociation,
        specialization: doctor[0].doctors.specialization,
        languagesSpoken: doctor[0].doctors.languagesSpoken as string[],
        locationOfHospital: doctor[0].doctors.locationOfHospital,
        medicalLicenseNumber: doctor[0].doctors.medicalLicenseNumber,
        yearsOfExperience: doctor[0].doctors.yearsOfExperience || 1,
        availability: doctor[0].doctors.availability as string,
        isVerified: doctor[0].doctors.isVerified,
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

      const licenseExpirationDateString =
        ctx.licenseExpirationDate instanceof Date
          ? ctx.licenseExpirationDate.toISOString().split('T')[0]
          : ctx.licenseExpirationDate;

      await this.db.insert(schema.doctors).values({
        userId: ctx.userId,
        bio: ctx.bio,
        servicesOffered: ctx.servicesOffered,
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

  async fetchAllDoctors(ctx: IFetchDoctors) {
    const { page = 1, limit = 12 } = ctx;
    const skip = (page - 1) * limit;
    try {
      const totalDoctorsResult = await this.db
        .select({ count: sql`count(*)`.as('count') })
        .from(schema.doctors)
        .innerJoin(schema.user, eq(schema.doctors.userId, schema.user.id))
        .where(eq(schema.user.role, 'DOCTOR'));

      const totalCount = Number(totalDoctorsResult[0]?.count ?? 0);
      const totalPages = Math.ceil(totalCount / limit);

      const doctors = await this.db
        .select()
        .from(schema.doctors)
        .innerJoin(schema.user, eq(schema.doctors.userId, schema.user.id))
        .where(eq(schema.user.role, 'DOCTOR'))
        .offset(skip)
        .limit(limit);

      const parsedDoctors: IDoctorSnippet[] = doctors.map((doctor) => ({
        userId: doctor.users.id,
        fullName: doctor.users.fullName,
        email: doctor.users.emailAddress,
        gender: doctor.users.gender,
        profilePicture: doctor.users.profilePicture as string,
        role: doctor.users.role,
        bio: doctor.doctors.bio || '',
        servicesOffered: doctor.doctors.servicesOffered as string[],
        certifications: doctor.doctors.certifications as string[],
        hospitalAssociation: doctor.doctors.hospitalAssociation,
        specialization: doctor.doctors.specialization,
        languagesSpoken: doctor.doctors.languagesSpoken as string[],
        locationOfHospital: doctor.doctors.locationOfHospital,
        medicalLicenseNumber: doctor.doctors.medicalLicenseNumber,
        yearsOfExperience: doctor.doctors.yearsOfExperience || 1,
        availability: doctor.doctors.availability as string,
        isVerified: doctor.doctors.isVerified as boolean,
      }));

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: DSM.DOCTOR_FETCHED,
        data: parsedDoctors,
        meta: {
          currentPage: page,
          totalPages,
          totalCount,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      });
    } catch (e) {
      return this.handler.handleError(e, DEM.ERROR_FETCHING_ALL_DOCTORS);
    }
  }
}
