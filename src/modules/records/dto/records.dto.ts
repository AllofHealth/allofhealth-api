import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateRecordDto {
  @ApiProperty({
    description: 'The title of the medical record',
    example: 'Annual Physical Examination',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description:
      'The unique identifier of the practitioner creating the record',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  practitionerId: string;

  @ApiProperty({
    description: 'The unique identifier of the patient',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsNotEmpty()
  @IsUUID()
  patientId: string;

  @ApiProperty({
    description: 'Clinical notes from the examination or consultation',
    example: [
      'Patient appears healthy',
      'Vital signs are normal',
      'No significant findings',
    ],
    type: [String],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  clinicalNotes: string[];

  @ApiProperty({
    description: 'Medical diagnoses made by the practitioner',
    example: ['Hypertension', 'Type 2 Diabetes'],
    type: [String],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  diagnosis: string[];

  @ApiPropertyOptional({
    description: 'Laboratory test results (optional)',
    example: ['Blood glucose: 120 mg/dL', 'Cholesterol: 180 mg/dL'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labResults?: string[];

  @ApiPropertyOptional({
    description: 'Medications prescribed to the patient (optional)',
    example: ['Metformin 500mg twice daily', 'Lisinopril 10mg once daily'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medicationsPrscribed?: string[];
}
