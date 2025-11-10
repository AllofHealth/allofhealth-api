import { PartialType } from '@nestjs/swagger';
import { CreateConsultationTypeDto } from './create-consultation-type.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateConsultationTypeDto extends PartialType(
    CreateConsultationTypeDto,
) {
    @ApiPropertyOptional({ description: 'Active status' })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
