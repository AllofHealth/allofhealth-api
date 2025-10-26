import { Injectable, Logger, Inject } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import type { Database } from '@/shared/drizzle/drizzle.types';
import { eq, and } from 'drizzle-orm';
import * as schema from '@/schemas/schema';

@Injectable()
export class ConsultationTypeProvider {
    private readonly logger = new Logger(ConsultationTypeProvider.name);
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database

    // Create consultation type
    async createConsultationType(data: {
        doctorId: string;
        name: string;
        slug: string;
        description?: string;
        durationMinutes: number;
        price: number;
        currency: string;
        calcomEventTypeId?: number;
    }) {
        try {
            const [consultationType] = await this.db
                .insert(schema.doctorConsultationTypes)
                .values({
                    doctorId: data.doctorId,
                    name: data.name,
                    slug: data.slug,
                    description: data.description,
                    durationMinutes: data.durationMinutes,
                    price: data.price.toString(),
                    currency: data.currency,
                    calcomEventTypeId: data.calcomEventTypeId,
                    isActive: true,
                })
                .returning();

            this.logger.log(`Consultation type created: ${consultationType.id}`);
            return consultationType;
        } catch (error) {
            this.logger.error('Failed to create consultation type', error);
            throw error;
        }
    }

   // Get doctor's consultation types
    async getDoctorConsultationTypes(doctorId: string, activeOnly = true) {
        const conditions = [
            eq(schema.doctorConsultationTypes.doctorId, doctorId),
        ];

        if (activeOnly) {
            conditions.push(eq(schema.doctorConsultationTypes.isActive, true));
        }

        return await this.db
            .select()
            .from(schema.doctorConsultationTypes)
            .where(and(...conditions));
    }

    //Find consultation type by ID
    async findById(id: string) {
        const [consultationType] = await this.db
            .select()
            .from(schema.doctorConsultationTypes)
            .where(eq(schema.doctorConsultationTypes.id, id))
            .limit(1);

        return consultationType;
    }

    // Find by Cal.com event type ID
    async findByCalcomEventTypeId(eventTypeId: number) {
        const [consultationType] = await this.db
            .select()
            .from(schema.doctorConsultationTypes)
            .where(
                eq(schema.doctorConsultationTypes.calcomEventTypeId, eventTypeId),
            )
            .limit(1);

        return consultationType;
    }

    // Update consultation type
    async updateConsultationType(
        id: string,
        data: Partial<{
            name: string;
            description: string;
            durationMinutes: number;
            price: number;
            isActive: boolean;
        }>,
    ) {
        const updateData: any = {};

        if (data.name) updateData.name = data.name;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.durationMinutes) updateData.durationMinutes = data.durationMinutes;
        if (data.price) updateData.price = data.price.toString();
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        const [consultationType] = await this.db
            .update(schema.doctorConsultationTypes)
            .set(updateData)
            .where(eq(schema.doctorConsultationTypes.id, id))
            .returning();

        return consultationType;
    }

   // Delete consultation type
    async deleteConsultationType(id: string) {
        await this.db
            .delete(schema.doctorConsultationTypes)
            .where(eq(schema.doctorConsultationTypes.id, id));

        this.logger.log(`Consultation type deleted: ${id}`);
    }
}