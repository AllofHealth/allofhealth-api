import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetDoctorAvailabilityDto {
  @ApiProperty({
    description: 'The ID of the doctor (user).',
    example: 'user-doctor-123',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'The ID of the consultation type.',
    example: 'consultation-type-456',
  })
  @IsNotEmpty()
  @IsString()
  consultationTypeId: string;

  @ApiProperty({
    description: 'Start date for fetching availability (ISO 8601 format).',
    example: '2025-11-10T00:00:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date for fetching availability (ISO 8601 format).',
    example: '2025-11-17T23:59:59Z',
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}

export class GetDoctorConsultationTypesDto {
  @ApiProperty({
    description: 'The ID of the doctor (user).',
    example: 'user-doctor-123',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Filter for active consultation types only.',
    example: true,
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  activeOnly?: boolean;
}

export class CheckSlotAvailabilityDto {
  @ApiProperty({
    description: 'The ID of the doctor (user).',
    example: 'user-doctor-123',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'The ID of the consultation type.',
    example: 'consultation-type-456',
  })
  @IsNotEmpty()
  @IsString()
  consultationTypeId: string;

  @ApiProperty({
    description:
      'The specific start time to check for availability (ISO 8601 format).',
    example: '2025-11-10T10:00:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  startTime: string;
}

export class GetCalComEmbedConfigDto {
  @ApiProperty({
    description: 'The ID of the consultation type.',
    example: 'consultation-type-456',
  })
  @IsNotEmpty()
  @IsString()
  consultationTypeId: string;
}