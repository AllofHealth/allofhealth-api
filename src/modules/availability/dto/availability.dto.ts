import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
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
    description: 'The unique identifier of the user',
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
