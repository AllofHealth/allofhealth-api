import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class SuccessResponseDto {
  @ApiProperty({
    description: 'The status code of the response',
    example: 200,
  })
  @IsNotEmpty()
  @IsNumber()
  status: number;

  @ApiPropertyOptional({
    description: 'The message of the response',
    example: 'Success',
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({
    description: 'The data of the response',
    example: { id: 1, name: 'John Doe' },
  })
  @IsOptional()
  @IsObject()
  data?: object;
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'The status code of the response',
    example: 200,
  })
  @IsNotEmpty()
  @IsNumber()
  status: number;

  @ApiPropertyOptional({
    description: 'The message of the response',
    example: 'Success',
  })
  @IsOptional()
  @IsString()
  message?: string;
}
