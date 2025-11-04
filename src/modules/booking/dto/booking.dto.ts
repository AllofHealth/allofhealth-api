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
    description: 'Doctor ID',
    example: 'doctor-456',
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
    description: 'Start date for filtering bookings (ISO 8601 format)',
    example: '2025-01-01T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for filtering bookings (ISO 8601 format)',
    example: '2025-12-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Filter bookings by status',
    example: 'confirmed',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;
}
