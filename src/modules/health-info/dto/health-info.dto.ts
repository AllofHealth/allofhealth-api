import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export enum TPainLevel {
  SEVERE = 'severe',
  MODERATE = 'moderate',
  MILD = 'mild',
}

export class CreateHealthInfoDto {
  @ApiProperty({
    description: 'The user identifier',
    example: '1234567890',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'How the user is feeling',
    example: 'I have been experiencing headaches and fatigue',
  })
  @IsNotEmpty()
  @IsString()
  howAreYouFeeling: string;

  @ApiProperty({
    description: 'When the symptoms started',
    example: '3 days ago',
  })
  @IsNotEmpty()
  @IsString()
  whenDidItStart: string;

  @ApiProperty({
    description: 'Pain level experienced',
    enum: TPainLevel,
    example: TPainLevel.MODERATE,
  })
  @IsNotEmpty()
  @IsEnum(TPainLevel)
  painLevel: TPainLevel;

  @ApiPropertyOptional({
    description: 'Known medical conditions',
    type: [String],
    example: ['hypertension', 'diabetes'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  knownConditions?: string[];

  @ApiPropertyOptional({
    description: 'Medications currently taken',
    type: [String],
    example: ['ibuprofen', 'lisinopril'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medicationsTaken?: string[];
}

export class UpdateHealthInfoDto {
  @ApiProperty({
    description: 'The user identifier',
    example: '1234567890',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiPropertyOptional({
    description: 'How the user is feeling',
    example: 'I have been experiencing headaches and fatigue',
  })
  @IsOptional()
  @IsString()
  howAreYouFeeling?: string;

  @ApiPropertyOptional({
    description: 'When the symptoms started',
    example: '3 days ago',
  })
  @IsOptional()
  @IsString()
  whenDidItStart?: string;

  @ApiPropertyOptional({
    description: 'Pain level experienced',
    enum: TPainLevel,
    example: TPainLevel.MODERATE,
  })
  @IsOptional()
  @IsEnum(TPainLevel)
  painLevel?: TPainLevel;

  @ApiPropertyOptional({
    description: 'Known medical conditions',
    type: [String],
    example: ['hypertension', 'diabetes'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  knownConditions?: string[];

  @ApiPropertyOptional({
    description: 'Medications currently taken',
    type: [String],
    example: ['ibuprofen', 'lisinopril'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medicationsTaken?: string[];
}

export class FetchHealthInfoDto {
  @ApiProperty({
    description: 'The user identifier',
    example: '1234567890',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiPropertyOptional({
    description: 'The approval identifier for accessing health info',
    example: 'approval-12345',
  })
  @IsOptional()
  @IsString()
  approvalId?: string;

  @ApiPropertyOptional({
    description: 'The specific health info identifier to fetch',
    example: 'health-info-67890',
  })
  @IsOptional()
  @IsString()
  healthInfoId?: string;
}
