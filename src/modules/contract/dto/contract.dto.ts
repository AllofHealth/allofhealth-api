import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class IsApprovedToAddRecordDto {
  @IsNotEmpty()
  @IsNumber()
  patientId: number;

  @IsNotEmpty()
  @IsString()
  doctorAddress: string;
}

export class ViewMedicalRecordDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  recordId: number;

  @IsOptional()
  @IsString()
  viewerAddress: string;
}
