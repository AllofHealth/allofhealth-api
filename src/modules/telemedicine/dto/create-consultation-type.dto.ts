import {
    IsString,
    IsNumber,
    IsOptional,
    IsNotEmpty,
    Min,
    MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConsultationTypeDto {
    @ApiProperty({ description: 'Consultation type name' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @ApiPropertyOptional({ description: 'Description of consultation' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @ApiProperty({ description: 'Duration in minutes', example: 30 })
    @IsNumber()
    @Min(15)
    durationMinutes: number;

    @ApiProperty({ description: 'Price', example: 50.0 })
    @IsNumber()
    @Min(0)
    price: number;

    @ApiPropertyOptional({ description: 'Currency code', example: 'USD' })
    @IsOptional()
    @IsString()
    @MaxLength(3)
    currency?: string;

    @ApiPropertyOptional({ description: 'Cal.com event type ID' })
    @IsOptional()
    @IsNumber()
    calcomEventTypeId?: number;
}
