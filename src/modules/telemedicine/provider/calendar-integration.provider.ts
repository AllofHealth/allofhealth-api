import { Injectable, Logger, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as schema from '@/schemas/schema';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';

// This manages doctor calendar connections (Cal.com OAuth tokens)
@Injectable()
export class CalendarIntegrationProvider {
    private readonly logger = new Logger(CalendarIntegrationProvider.name);

    constructor(
        @Inject(DRIZZLE_PROVIDER) private readonly db: Database
    ) { }

    // Create or update calendar integration
    async upsertIntegration(data: {
        doctorId: string;
        provider: string;
        accessToken: string;
        refreshToken?: string;
        expiresAt?: Date;
        providerUserId?: string;
        providerEmail?: string;
    }) {
        try {
            // Check if integration exists
            const existing = await this.findByDoctorId(data.doctorId, data.provider);

            if (existing) {
                // Update existing
                const [updated] = await this.db
                    .update(schema.doctorCalendarIntegrations)
                    .set({
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                        expiresAt: data.expiresAt,
                        providerUserId: data.providerUserId,
                        providerEmail: data.providerEmail,
                        isActive: true,
                        lastSyncAt: new Date(),
                    })
                    .where(eq(schema.doctorCalendarIntegrations.id, existing.id))
                    .returning();

                return updated;
            }

            // Create new
            const [integration] = await this.db
                .insert(schema.doctorCalendarIntegrations)
                .values({
                    doctorId: data.doctorId,
                    provider: data.provider,
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                    expiresAt: data.expiresAt,
                    providerUserId: data.providerUserId,
                    providerEmail: data.providerEmail,
                    isActive: true,
                    lastSyncAt: new Date(),
                })
                .returning();

            this.logger.log(`Calendar integration created for doctor ${data.doctorId}`);
            return integration;
        } catch (error) {
            this.logger.error('Failed to upsert calendar integration', error);
            throw error;
        }
    }

    // Find integration by doctor ID
    async findByDoctorId(doctorId: string, provider = 'calcom') {
        const [integration] = await this.db
            .select()
            .from(schema.doctorCalendarIntegrations)
            .where(
                eq(schema.doctorCalendarIntegrations.doctorId, doctorId),
            )
            .limit(1);

        return integration;
    }

    // Check if doctor has active calendar integration
    async hasActiveIntegration(doctorId: string): Promise<boolean> {
        const integration = await this.findByDoctorId(doctorId);
        return integration?.isActive ?? false;
    }

    // Deactivate integration
    async deactivateIntegration(integrationId: string) {
        await this.db
            .update(schema.doctorCalendarIntegrations)
            .set({ isActive: false })
            .where(eq(schema.doctorCalendarIntegrations.id, integrationId));

        this.logger.log(`Calendar integration ${integrationId} deactivated`);
    }

    // Update last sync timestamp
    async updateLastSync(integrationId: string) {
        await this.db
            .update(schema.doctorCalendarIntegrations)
            .set({ lastSyncAt: new Date() })
            .where(eq(schema.doctorCalendarIntegrations.id, integrationId));
    }
}