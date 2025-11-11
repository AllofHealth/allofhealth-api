import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsUUID,
} from 'class-validator';

export class CreateDoctorConsultationTypeDto {
  @ApiProperty({
    description: 'The ID of the user (doctor).',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'The ID of the consultation type.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsNotEmpty()
  consultationTypeId: string;

  @ApiProperty({
    description: 'A description of the consultation type.',
    example: 'A 30 minute follow-up consultation.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The duration of the consultation in minutes. Defaults to 30.',
    example: 30,
  })
  @IsNumber()
  @IsOptional()
  durationMinutes?: number;

  @ApiProperty({
    description: 'The price of the consultation.',
    example: 100,
  })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    description: 'The currency for the price.',
    example: 'USD',
  })
  @IsString()
  @IsNotEmpty()
  currency: string;
}

export class GetDoctorConsultationTypesDto {
  @ApiProperty({
    description: 'The ID of the user (doctor).',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description:
      'Flag to only include active consultation types. Defaults to true.',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  activeOnly?: boolean;
}

export class UpdateDoctorConsultationTypeDto {
  @ApiProperty({
    description: 'The ID of the consultation type.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'The ID of the user (doctor).',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'A description of the consultation type.',
    example: 'A 45 minute detailed consultation.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The duration of the consultation in minutes.',
    example: 45,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  durationMinutes?: number;

  @ApiProperty({
    description: 'The price of the consultation.',
    example: 150,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({
    description: 'Whether the consultation type is active.',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateDeleteConsultationTypeQueryDto {
  @ApiProperty({
    description: 'The ID of the consultation type.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'The ID of the user (doctor).',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}

export class AddNewConsultationTypeDto {
  @ApiProperty({
    description: 'The name of the new consultation type',
    example: 'Video Call',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}