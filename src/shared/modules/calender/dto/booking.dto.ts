import {
    IsDate,
    IsEmail,
    IsInt,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    IsTimeZone,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Attendee Info DTO
 */
export class AttendeeDto {
    @ApiProperty({ description: 'Attendee full name' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Attendee email address' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: 'Attendee timezone' })
    @IsTimeZone()
    @IsNotEmpty()
    timeZone: string;

    @ApiPropertyOptional({ description: 'Attendee phone number' })
    @IsOptional()
    @IsString()
    phoneNumber?: string;
}

//Create Booking DTO
export class CreateBookingDto {
    @ApiProperty({ description: 'Cal.com event type ID' })
    @IsInt()
    @Type(() => Number)
    eventTypeId: number;

    @ApiProperty({ description: 'Booking start time' })
    @IsDate()
    @Type(() => Date)
    startTime: Date;

    @ApiProperty({ description: 'Consultation duration in minutes' })
    @IsInt()
    @Type(() => Number)
    lengthInMinutes: number;

    @ApiProperty({ description: 'Attendee information', type: AttendeeDto })
    @ValidateNested()
    @Type(() => AttendeeDto)
    attendee: AttendeeDto;

    @ApiPropertyOptional({ description: 'Custom meeting URL (Doxy.me link)' })
    @IsOptional()
    @IsString()
    meetingUrl?: string;

    @ApiPropertyOptional({ description: 'Additional metadata' })
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}

//Booking Response DTO
export class BookingResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    uid: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    startTime: Date;

    @ApiProperty()
    endTime: Date;

    @ApiProperty()
    status: string;

    @ApiPropertyOptional()
    meetingUrl?: string;

    @ApiProperty()
    attendees: AttendeeDto[];

    @ApiPropertyOptional()
    metadata?: Record<string, any>;
}