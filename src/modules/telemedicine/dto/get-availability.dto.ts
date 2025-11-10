import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetAvailabilityDto {
    @ApiProperty({ description: 'Consultation type ID' })
    @IsString()
    @IsNotEmpty()
    consultationTypeId: string;

    @ApiPropertyOptional({ description: 'Start date (ISO 8601)' })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({ description: 'End date (ISO 8601)' })
    @IsOptional()
    @IsDateString()
    endDate?: string;
}
