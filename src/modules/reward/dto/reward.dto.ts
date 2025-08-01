import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RewardMetricsQueryDto {
  @ApiProperty({
    description: 'User ID to fetch reward metrics for',
    example: 'user-123456',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;
}

export class RewardMetricsResponseDto {
  @ApiProperty({
    description: 'Total points earned by the user',
    example: 150,
  })
  totalPointsEarned: number;

  @ApiPropertyOptional({
    description: 'Total claimed reward balance',
    example: 100,
  })
  claimedBalance?: number;

  @ApiPropertyOptional({
    description: 'Pending rewards for the user',
    example: 50,
  })
  pendingRewards?: number;
}
