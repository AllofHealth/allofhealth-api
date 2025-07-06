import { TAccess } from '@/modules/contract/interface/contract.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateApprovalDto {
  @ApiProperty({ description: 'User ID', example: '1234567890' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Practitioner ID', example: '1234567890' })
  @IsNotEmpty()
  @IsString()
  practitionerId: string;

  @ApiPropertyOptional({
    description: 'Medical record contract id',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  recordId?: number;

  @ApiPropertyOptional({
    description: 'Access Duration in milliseconds',
    example: 3600,
  })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty({
    description: 'Access Level',
    examples: ['read', 'write', 'full'],
  })
  @IsOptional()
  @IsString()
  accessLevel: TAccess;
}
