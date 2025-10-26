// src/modules/telemedicine/service/doctor-availability.service.ts

import {
    Injectable,
    Logger,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { CalendarIntegrationService } from '@/shared/calender/service/calendar-integration.service';
import { ConsultationTypeProvider } from '../provider/consultation-type.provider';

@Injectable()
export class DoctorAvailabilityService {
    private readonly logger = new Logger(DoctorAvailabilityService.name);

    constructor(
        private readonly calendarService: CalendarIntegrationService,
        private readonly consultationTypeProvider: ConsultationTypeProvider,
    ) { }

    /**
     * Get doctor's available time slots
     * Fetches from Cal.com based on the doctor's event type
     */
    async getDoctorAvailability(
        doctorId: string,
        consultationTypeId: string,
        startDate: Date,
        endDate: Date,
    ) {
        try {
            this.logger.log(
                `Fetching availability for doctor ${doctorId}, consultation type ${consultationTypeId}`,
            );

            // Step 1: Get consultation type details (includes Cal.com event type ID)
            const consultationType =
                await this.consultationTypeProvider.findById(consultationTypeId);

            if (!consultationType) {
                throw new NotFoundException('Consultation type not found');
            }

            if (!consultationType.calcomEventTypeId) {
                throw new BadRequestException(
                    'Consultation type not linked to Cal.com event',
                );
            }

            // Step 2: Fetch availability from Cal.com
            const availability = await this.calendarService.getAvailability(
                consultationType.calcomEventTypeId,
                startDate,
                endDate,
            );

            // Step 3: Format response with consultation type details
            return {
                consultationType: {
                    id: consultationType.id,
                    name: consultationType.name,
                    duration: consultationType.durationMinutes,
                    price: parseFloat(consultationType.price),
                    currency: consultationType.currency,
                },
                slots: availability.slots.map((slot) => ({
                    start: slot.start,
                    end: slot.end,
                    available: slot.available,
                })),
            };
        } catch (error) {
            this.logger.error('Failed to fetch doctor availability', error);
            throw error;
        }
    }

    /**
     * Get Cal.com embed configuration for frontend
     * Returns the necessary data to embed Cal.com widget
     */
    async getCalcomEmbedConfig(doctorId: string, consultationTypeId: string) {
        try {
            const consultationType =
                await this.consultationTypeProvider.findById(consultationTypeId);

            if (!consultationType) {
                throw new NotFoundException('Consultation type not found');
            }

            if (!consultationType.calcomEventTypeId) {
                throw new BadRequestException(
                    'Consultation type not configured for bookings',
                );
            }

            // Return configuration for frontend Cal.com embed
            return {
                eventTypeId: consultationType.calcomEventTypeId,
                consultationType: {
                    id: consultationType.id,
                    name: consultationType.name,
                    description: consultationType.description,
                    duration: consultationType.durationMinutes,
                    price: parseFloat(consultationType.price),
                    currency: consultationType.currency,
                },
                embedConfig: {
                    // Cal.com embed configuration
                    theme: 'light',
                    hideEventTypeDetails: false,
                    layout: 'month_view',
                },
            };
        } catch (error) {
            this.logger.error('Failed to get embed config', error);
            throw error;
        }
    }

    //Get all consultation types for a doctor
    async getDoctorConsultationTypes(doctorId: string) {
        try {
            const consultationTypes =
                await this.consultationTypeProvider.getDoctorConsultationTypes(
                    doctorId,
                    true,
                );

            return consultationTypes.map((type) => ({
                id: type.id,
                name: type.name,
                slug: type.slug,
                description: type.description,
                duration: type.durationMinutes,
                price: parseFloat(type.price),
                currency: type.currency,
                calcomEventTypeId: type.calcomEventTypeId,
                isActive: type.isActive,
            }));
        } catch (error) {
            this.logger.error('Failed to fetch consultation types', error);
            throw error;
        }
    }

    // Create a new consultation type for a doctor
    async createConsultationType(
        doctorId: string,
        data: {
            name: string;
            description?: string;
            durationMinutes: number;
            price: number;
            currency?: string;
            calcomEventTypeId?: number;
        },
    ) {
        try {
            // Generate slug from name
            const slug = data.name
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');

            const consultationType =
                await this.consultationTypeProvider.createConsultationType({
                    doctorId,
                    name: data.name,
                    slug,
                    description: data.description,
                    durationMinutes: data.durationMinutes,
                    price: data.price,
                    currency: data.currency || 'USD',
                    calcomEventTypeId: data.calcomEventTypeId,
                });

            this.logger.log(`Consultation type created: ${consultationType.id}`);

            return {
                id: consultationType.id,
                name: consultationType.name,
                slug: consultationType.slug,
                description: consultationType.description,
                duration: consultationType.durationMinutes,
                price: parseFloat(consultationType.price),
                currency: consultationType.currency,
                calcomEventTypeId: consultationType.calcomEventTypeId,
            };
        } catch (error) {
            this.logger.error('Failed to create consultation type', error);
            throw error;
        }
    }

    //Update consultation type
    async updateConsultationType(
        consultationTypeId: string,
        data: Partial<{
            name: string;
            description: string;
            durationMinutes: number;
            price: number;
            isActive: boolean;
        }>,
    ) {
        try {
            const updated =
                await this.consultationTypeProvider.updateConsultationType(
                    consultationTypeId,
                    data,
                );

            if (!updated) {
                throw new NotFoundException('Consultation type not found');
            }

            return {
                id: updated.id,
                name: updated.name,
                slug: updated.slug,
                description: updated.description,
                duration: updated.durationMinutes,
                price: parseFloat(updated.price),
                currency: updated.currency,
                isActive: updated.isActive,
            };
        } catch (error) {
            this.logger.error('Failed to update consultation type', error);
            throw error;
        }
    }

    //Check if a specific time slot is available
    async checkSlotAvailability(
        doctorId: string,
        consultationTypeId: string,
        startTime: Date,
    ): Promise<boolean> {
        try {
            const endTime = new Date(startTime);
            endTime.setHours(endTime.getHours() + 1); // Check 1 hour window 

            const availability = await this.getDoctorAvailability(
                doctorId,
                consultationTypeId,
                startTime,
                endTime,
            );

            // Check if the requested time matches any available slot
            return availability.slots.some(
                (slot) =>
                    slot.available &&
                    new Date(slot.start).getTime() === startTime.getTime(),
            );
        } catch (error) {
            this.logger.error('Failed to check slot availability', error);
            return false;
        }
    }
}