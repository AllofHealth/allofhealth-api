// src/shared/calendar/dto/availability.dto.ts

import {
    IsDate,
    IsInt,
    IsOptional,
    IsString,
    IsTimeZone,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Get Availability Query DTO
 */
export class GetAvailabilityDto {
    @ApiProperty({ description: 'Cal.com event type ID' })
    @IsInt()
    @Type(() => Number)
    eventTypeId: number;

    @ApiProperty({ description: 'Start date for availability check' })
    @IsDate()
    @Type(() => Date)
    startDate: Date;

    @ApiProperty({ description: 'End date for availability check' })
    @IsDate()
    @Type(() => Date)
    endDate: Date;

    @ApiPropertyOptional({ description: 'Timezone (e.g., America/New_York)' })
    @IsOptional()
    @IsTimeZone()
    timeZone?: string;
}

/**
 * Time Slot Response DTO
 */
export class TimeSlotDto {
    @ApiProperty()
    start: Date;

    @ApiProperty()
    end: Date;

    @ApiProperty()
    available: boolean;
}

/**
 * Availability Response DTO
 */
export class AvailabilityResponseDto {
    @ApiProperty({ type: [TimeSlotDto] })
    slots: TimeSlotDto[];
}

