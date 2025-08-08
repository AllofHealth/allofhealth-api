import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TMood } from '../interface/health-journal.interface';

export class AddEntryDto {
  @ApiProperty({ description: 'User ID', example: '1234567890' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Mood',
    examples: ['great', 'good', 'neutral', 'low', 'bad'],
  })
  @IsNotEmpty()
  @IsString()
  mood: TMood;

  @ApiProperty({ description: 'Symptoms', example: ['headache', 'fever'] })
  @IsOptional()
  @IsArray()
  symptoms?: string[];

  @ApiProperty({
    description: 'Activities',
    example: ['took a walk', 'swimming'],
  })
  @IsOptional()
  @IsArray()
  activities?: string[];

  @ApiProperty({ description: 'Tags', example: ['workout', 'health'] })
  @IsOptional()
  @IsArray()
  tags?: string[];
}
