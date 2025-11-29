import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TBookingStatus } from '../interface/booking.interface';

export class InitializeBookingPaymentDto {
  @ApiProperty({
    description: 'User Id',
    example: 'user-123456',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'User Email',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Calcom Booking id',
    example: 'booking-123456',
  })
  @IsNotEmpty()
  @IsString()
  calcomBookingId: string;
}

export class GetBookingDto {
  @ApiProperty({
    description: 'User Id',
    example: 'user-123456',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Booking Id',
    example: 'booking-123456',
  })
  @IsNotEmpty()
  @IsString()
  bookingId: string;
}

export class GetPatientBookingsDto {
  @ApiProperty({
    description: 'Patient ID',
    example: 'patient-123',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 12,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiProperty({
    description: 'Filter bookings by status',
    example: 'confirmed',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;
}

export class GetDoctorBookingsDto {
  @ApiProperty({
    description:
      'The unique identifier of the doctor whose bookings are being retrieved',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Page number for pagination (1-based index)',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiProperty({
    description: 'Maximum number of bookings to return per page',
    example: 12,
    required: false,
    default: 12,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiProperty({
    description:
      'Start date for filtering bookings (inclusive). Only bookings scheduled on or after this date will be returned. Format: ISO 8601 date-time string',
    example: '2025-01-01T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description:
      'End date for filtering bookings (inclusive). Only bookings scheduled on or before this date will be returned. Format: ISO 8601 date-time string',
    example: '2025-12-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: `Filter bookings by their current status. Available statuses:
    - pending_payment: Booking created but payment not yet initiated
    - processing_payment: Payment is being processed
    - confirmed: Booking confirmed and paid
    - completed: Consultation has been completed
    - cancelled: Booking was cancelled by patient or doctor
    - no_show: Patient did not attend the scheduled consultation`,
    example: 'confirmed',
    enum: [
      'pending_payment',
      'processing_payment',
      'confirmed',
      'completed',
      'cancelled',
      'no_show',
    ],
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: TBookingStatus;
}
