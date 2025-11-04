import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { DoctorAvailabilityService } from '../service/doctor-availability.service';

/**
 * This handles doctor availability, consultation types, and schedule management
 */
@ApiTags('Telemedicine - Doctor Schedule')
@Controller('telemedicine/doctors')
// @UseGuards(JwtAuthGuard) // We have to when auth is ready
export class DoctorScheduleController {
  constructor(
    private readonly availabilityService: DoctorAvailabilityService,
  ) {}

  /**
   * Get doctor's consultation types
   * GET /telemedicine/doctors/:doctorId/consultation-types
   */
  @Get(':doctorId/consultation-types')
  @ApiOperation({ summary: 'Get all consultation types for a doctor' })
  @ApiParam({ name: 'doctorId', description: 'Doctor ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of consultation types',
  })
  async getConsultationTypes(@Param('doctorId') doctorId: string) {
    const consultationTypes =
      await this.availabilityService.getDoctorConsultationTypes(doctorId);

    return {
      success: true,
      data: consultationTypes,
    };
  }

  /**
   * Create consultation type
   * POST /telemedicine/doctors/consultation-types
   */
  @Post('consultation-types')
  @ApiOperation({ summary: 'Create a new consultation type' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Consultation type created successfully',
  })
  async createConsultationType(
    @Request() req: any,
    @Body()
    body: {
      name: string;
      description?: string;
      durationMinutes: number;
      price: number;
      currency?: string;
      calcomEventTypeId?: number;
    },
  ) {
    // In production, get doctorId from authenticated user
    const doctorId = req.user?.doctorId || 'doctor-id-from-token';

    const consultationType =
      await this.availabilityService.createConsultationType(doctorId, body);

    return {
      success: true,
      message: 'Consultation type created successfully',
      data: consultationType,
    };
  }

  /**
   * Update consultation type
   * PATCH /telemedicine/doctors/consultation-types/:id
   */
  @Patch('consultation-types/:id')
  @ApiOperation({ summary: 'Update consultation type' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Consultation type ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Consultation type updated',
  })
  async updateConsultationType(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      name: string;
      description: string;
      durationMinutes: number;
      price: number;
      isActive: boolean;
    }>,
  ) {
    const updated = await this.availabilityService.updateConsultationType(
      id,
      body,
    );

    return {
      success: true,
      message: 'Consultation type updated successfully',
      data: updated,
    };
  }

  /**
   * Get doctor availability
   * GET /telemedicine/doctors/:doctorId/availability
   */
  @Get(':doctorId/availability')
  @ApiOperation({ summary: "Get doctor's available time slots" })
  @ApiParam({ name: 'doctorId', description: 'Doctor ID' })
  @ApiQuery({ name: 'consultationTypeId', description: 'Consultation type ID' })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date (ISO 8601)',
    required: false,
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date (ISO 8601)',
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Available time slots',
  })
  async getDoctorAvailability(
    @Param('doctorId') doctorId: string,
    @Query('consultationTypeId') consultationTypeId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Default to next 7 days if not provided
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate
      ? new Date(endDate)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const availability = await this.availabilityService.getDoctorAvailability(
      doctorId,
      consultationTypeId,
      start,
      end,
    );

    return {
      success: true,
      data: availability,
    };
  }

  /**
   * Get Cal.com embed configuration
   * GET /telemedicine/doctors/:doctorId/embed-config
   */
  @Get(':doctorId/embed-config')
  @ApiOperation({ summary: 'Get Cal.com embed configuration for frontend' })
  @ApiParam({ name: 'doctorId', description: 'Doctor ID' })
  @ApiQuery({ name: 'consultationTypeId', description: 'Consultation type ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cal.com embed configuration',
  })
  async getEmbedConfig(
    @Param('doctorId') doctorId: string,
    @Query('consultationTypeId') consultationTypeId: string,
  ) {
    const embedConfig = await this.availabilityService.getCalcomEmbedConfig(
      doctorId,
      consultationTypeId,
    );

    return {
      success: true,
      data: embedConfig,
    };
  }

  /**
   * Check specific slot availability
   * GET /telemedicine/doctors/:doctorId/check-slot
   */
  @Get(':doctorId/check-slot')
  @ApiOperation({ summary: 'Check if a specific time slot is available' })
  @ApiParam({ name: 'doctorId', description: 'Doctor ID' })
  @ApiQuery({ name: 'consultationTypeId', description: 'Consultation type ID' })
  @ApiQuery({ name: 'startTime', description: 'Slot start time (ISO 8601)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Slot availability status',
  })
  async checkSlotAvailability(
    @Param('doctorId') doctorId: string,
    @Query('consultationTypeId') consultationTypeId: string,
    @Query('startTime') startTime: string,
  ) {
    const isAvailable = await this.availabilityService.checkSlotAvailability(
      doctorId,
      consultationTypeId,
      new Date(startTime),
    );

    return {
      success: true,
      data: {
        available: isAvailable,
        startTime: new Date(startTime),
      },
    };
  }
}
