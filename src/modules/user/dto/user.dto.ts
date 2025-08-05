import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import type { TRole } from '@/shared/interface/shared.interface';

export class CreateUserDto {
  @ApiProperty({
    description: 'The full name of the user',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  emailAddress: string;

  @ApiProperty({
    description: 'The date of birth of the user',
    example: '1990-01-01',
  })
  @IsNotEmpty()
  @IsDateString()
  dateOfBirth: Date;

  @ApiProperty({
    description: 'The gender of the user',
    example: 'Male',
  })
  @IsNotEmpty()
  @IsString()
  gender: string;

  @ApiProperty({
    description: 'The phone number of the user',
    example: '+1234567890',
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'password123',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    description: 'The URL of the government ID of the user',
    example: 'https://example.com/government-id.jpg',
  })
  @IsNotEmpty()
  @IsUrl()
  governmentIdUrl: string;

  @ApiPropertyOptional({
    description: 'The specialization of the doctor',
    example: 'Cardiologist',
    required: false,
  })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({
    description: 'The medical license number of the doctor',
    example: '123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  medicalLicenseNumber?: string;

  @ApiPropertyOptional({
    description: 'The URL of the scanned medical license of the doctor',
    example: 'https://example.com/medical-license.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  scannedLicenseUrl?: string;

  @ApiPropertyOptional({
    description: 'The years of experience of the doctor',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  yearsOfExperience?: number;

  @ApiPropertyOptional({
    description: 'The certifications of the doctor',
    example: ['Certification 1', 'Certification 2'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @ApiPropertyOptional({
    description: 'The hospital association of the doctor',
    example: 'Association 1',
    required: false,
  })
  @IsOptional()
  @IsString()
  hospitalAssociation?: string;

  @ApiPropertyOptional({
    description: 'The location of the hospital of the doctor',
    example: 'Location 1',
    required: false,
  })
  @IsOptional()
  @IsString()
  locationOfHospital?: string;

  @ApiPropertyOptional({
    description: 'The languages spoken by the doctor',
    example: ['English', 'Spanish'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languagesSpoken?: string[];

  @ApiPropertyOptional({
    description: "The expiration date of the doctor's license",
    example: '2023-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  licenseExpirationDate?: Date;

  @ApiProperty({
    description: 'The role of the user',
    example: 'doctor',
    required: true,
  })
  role: TRole;
}

export class UserSnippetDto {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'The full name of the user',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The profile picture URL of the user',
    example: 'https://example.com/profile-pictures/john-doe.jpg',
  })
  @IsNotEmpty()
  @IsString()
  profilePicture: string;

  @ApiProperty({
    description: 'The role of the user',
    example: 'patient',
  })
  @IsNotEmpty()
  @IsString()
  role: string;

  @ApiProperty({
    description: 'The gender of the user',
    example: 'male',
  })
  @IsNotEmpty()
  @IsString()
  gender: string;
}

export class UpdateUserDto {
  @ApiProperty({
    description: 'The users identifier',
    example: '1234567890',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiPropertyOptional({
    description: 'The full name of the user',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsEmail()
  emailAddress?: string;

  @ApiPropertyOptional({
    description: 'The date of birth of the user',
    example: '1990-01-01',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: Date;

  @ApiPropertyOptional({
    description: 'The gender of the user',
    example: 'Male',
  })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({
    description: 'The phone number of the user',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'The password of the user',
    example: 'password123',
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({
    description: 'The specialization of the doctor',
    example: 'Cardiologist',
    required: false,
  })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({
    description: 'The medical license number of the doctor',
    example: '123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  medicalLicenseNumber?: string;

  @ApiPropertyOptional({
    description: 'The hospital association of the doctor',
    example: 'Association 1',
    required: false,
  })
  @IsOptional()
  @IsString()
  hospitalAssociation?: string;

  @ApiPropertyOptional({
    description: 'The location of the hospital of the doctor',
    example: 'Location 1',
    required: false,
  })
  @IsOptional()
  @IsString()
  locationOfHospital?: string;
}

export class ResendOtpDto {
  @ApiProperty({
    description: 'The email address to resend OTP to',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  emailAddress: string;
}
