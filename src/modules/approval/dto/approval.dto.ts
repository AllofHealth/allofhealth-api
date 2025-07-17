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

export class FetchDoctorApprovalsDto {
  @ApiProperty({
    description: 'Doctor User ID to fetch approvals for',
    example: '1234567890',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;
}

export class AcceptApprovalDto {
  @ApiProperty({
    description: 'Doctor User ID accepting the approval',
    example: '1234567890',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Approval ID to accept',
    example: '0987654321',
  })
  @IsNotEmpty()
  @IsString()
  approvalId: string;
}

export class RejectApprovalDto {
  @ApiProperty({
    description: 'Doctor User ID rejecting the approval',
    example: '1234567890',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Approval ID to reject',
    example: '0987654321',
  })
  @IsNotEmpty()
  @IsString()
  approvalId: string;
}

export class FindApprovalDto {
  @ApiProperty({
    description: 'Approval ID to find',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsString()
  approvalId: string;
}
