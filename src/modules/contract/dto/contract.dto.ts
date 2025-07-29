import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

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

  @IsNotEmpty()
  @IsString()
  viewerAddress: string;
}
