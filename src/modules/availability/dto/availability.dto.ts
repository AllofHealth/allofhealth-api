import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';

export enum WeekDay {
  SUNDAY = 'SUNDAY',
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
}

class AvailabilityConfigDto {
  @ApiProperty({
    description: 'Day of the week',
    enum: WeekDay,
    example: WeekDay.MONDAY,
  })
  @IsEnum(WeekDay)
  weekDay: WeekDay;

  @ApiProperty({
    description: 'Start time in HH:mm AM/PM format',
    example: '09:00 AM',
  })
  @IsString()
  @Matches(/^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/, {
    message: 'startTime must be in HH:mm AM/PM format',
  })
  startTime: string;

  @ApiProperty({
    description: 'End time in HH:mm AM/PM format',
    example: '05:00 PM',
  })
  @IsString()
  @Matches(/^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/, {
    message: 'endTime must be in HH:mm AM/PM format',
  })
  endTime: string;
}

export class CreateAvailabilityDto {
  @ApiProperty({
    description: 'The unique identifier of the user (doctor)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'List of availability configurations for the week',
    type: [AvailabilityConfigDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityConfigDto)
  availabilityConfig: AvailabilityConfigDto[];
}

export class FetchDoctorAvailabilityDto {
  @ApiProperty({
    description: 'The ID of the doctor whose availability is to be fetched.',
    example: 'c2d1b0a8-0b9c-4a1a-8e0a-4b0c0e1a2b3c',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}

class UpdateAvailabilityConfigDto {
  @ApiProperty({ description: 'The ID of the availability slot to update.' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiPropertyOptional({
    description: 'Start time in HH:mm AM/PM format',
    example: '08:00 AM',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/, {
    message: 'startTime must be in HH:mm AM/PM format',
  })
  startTime?: string;

  @ApiPropertyOptional({
    description: 'End time in HH:mm AM/PM format',
    example: '06:00 PM',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/, {
    message: 'endTime must be in HH:mm AM/PM format',
  })
  endTime?: string;
}

export class UpdateDoctorAvailabilityDto {
  @ApiProperty({ description: 'The unique identifier of the user (doctor)' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ type: [UpdateAvailabilityConfigDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAvailabilityConfigDto)
  availabilityConfig: UpdateAvailabilityConfigDto[];
}

export class DeleteAvailabilityDto {
  @ApiProperty({
    description:
      'The unique identifier of the user (doctor) whose availability slots are to be deleted.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'An array of availability slot IDs to be deleted.',
    type: [String],
    example: [
      'c2d1b0a8-0b9c-4a1a-8e0a-4b0c0e1a2b3c',
      'd3e2c1b0-c9d8-b7a6-f5e4-d3c2b1a0e9f8',
    ],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  availabilityIds: string[];
}
