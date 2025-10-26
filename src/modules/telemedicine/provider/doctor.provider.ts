import { Injectable, Logger, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as schema from '@/schemas/schema';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';


@Injectable()
export class DoctorProvider {
    private readonly logger = new Logger(DoctorProvider.name);

    constructor(
        @Inject(DRIZZLE_PROVIDER)
        private readonly db: Database, 
    ) { }

    // find a doctor
    async findDoctorById(doctorId: string) {
        const [doctor] = await this.db
            .select()
            .from(schema.doctors)
            .where(eq(schema.doctors.id, doctorId))
            .limit(1);

        return doctor;
    }

    // find doctor by user id 
    async findDoctorByUserId(userId: string) {
        const [doctor] = await this.db
            .select()
            .from(schema.doctors)
            .where(eq(schema.doctors.userId, userId))
            .limit(1);

        return doctor;
    }

    //Get doctor with user details
    async getDoctorWithUser(doctorId: string) {
        const result = await this.db
            .select({
                doctor: schema.doctors,
                user: schema.user,
            })
            .from(schema.doctors)
            .leftJoin(schema.user, eq(schema.doctors.userId, schema.user.id))
            .where(eq(schema.doctors.id, doctorId))
            .limit(1);

        if (!result || result.length === 0) {
            return null;
        }

        return {
            ...result[0].doctor,
            user: result[0].user,
        };
    }

    // Get all verified doctors
    async getVerifiedDoctors() {
        return await this.db
            .select({
                doctor: schema.doctors,
                user: schema.user,
            })
            .from(schema.doctors)
            .leftJoin(schema.user, eq(schema.doctors.userId, schema.user.id))
            .where(eq(schema.doctors.isVerified, true));
    }
}