import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ description: 'OTP token', example: '123456' })
  @IsNotEmpty()
  @IsString()
  token: string;
}
