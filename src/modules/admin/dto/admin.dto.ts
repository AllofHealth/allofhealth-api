import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';

export type TPermissionLevel = 'super' | 'system';
export type TPractitionerRole = 'doctor' | 'pharmacist';

export class CreateSuperAdminDto {
  @ApiProperty({
    description: 'Username for the super admin',
    example: 'superadmin01',
  })
  @IsNotEmpty()
  @IsString()
  userName: string;

  @ApiProperty({
    description: 'Email address for the super admin',
    example: 'superadmin@allofhealth.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password for the super admin',
    example: 'SecurePassword123!',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiPropertyOptional({
    description: 'Permission level for the admin',
    enum: ['super', 'system'],
    example: 'super',
  })
  @IsOptional()
  @IsIn(['super', 'system'])
  permissionLevel?: TPermissionLevel;
}

export class CreateSystemAdminDto {
  @ApiProperty({
    description: 'User ID of the super admin creating this system admin',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Username for the system admin',
    example: 'systemadmin01',
  })
  @IsNotEmpty()
  @IsString()
  userName: string;

  @ApiProperty({
    description: 'Email address for the system admin',
    example: 'systemadmin@allofhealth.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password for the system admin',
    example: 'SecurePassword123!',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiPropertyOptional({
    description: 'Permission level for the admin',
    enum: ['super', 'system'],
    example: 'system',
  })
  @IsOptional()
  @IsIn(['super', 'system'])
  permissionLevel?: TPermissionLevel;
}

export class ManagePermissionsDto {
  @ApiProperty({
    description: 'User ID of the super admin managing permissions',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'ID of the admin whose permissions are being managed',
    example: '507f1f77bcf86cd799439022',
  })
  @IsNotEmpty()
  @IsString()
  adminId: string;

  @ApiProperty({
    description: 'New permission level to assign',
    enum: ['super', 'system'],
    example: 'system',
  })
  @IsNotEmpty()
  @IsIn(['super', 'system'])
  permissionLevel: TPermissionLevel;
}

export class AdminLoginDto {
  @ApiProperty({
    description: 'Admin email address',
    example: 'admin@allofhealth.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Admin password',
    example: 'AdminPassword123!',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class VerifyPractitionerDto {
  @ApiProperty({
    description: 'ID of the practitioner to verify',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsString()
  practitionerId: string;

  @ApiProperty({
    description: 'Role of the practitioner',
    enum: ['doctor', 'pharmacist'],
    example: 'doctor',
  })
  @IsNotEmpty()
  @IsIn(['doctor', 'pharmacist'])
  role: TPractitionerRole;
}

export class DeleteAdminDto {
  @ApiProperty({
    description: 'User ID of the super admin performing the deletion',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'ID of the admin to be deleted',
    example: '507f1f77bcf86cd799439022',
  })
  @IsNotEmpty()
  @IsString()
  adminId: string;
}
