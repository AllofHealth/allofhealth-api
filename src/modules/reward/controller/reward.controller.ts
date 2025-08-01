import { Controller, Get, Query, UseGuards, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { OwnerGuard } from '@/modules/user/guard/user.guard';
import { RewardService } from '../service/reward.service';
import { RewardMetricsQueryDto } from '../dto/reward.dto';
import { ErrorResponseDto, SuccessResponseDto } from '@/shared/dtos/shared.dto';

@ApiTags('Reward Operations')
@Controller('reward')
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @Get('fetchRewardMetrics')
  @UseGuards(AuthGuard, OwnerGuard)
  @ApiOperation({
    summary: 'Fetch user reward metrics',
    description:
      'Fetches reward metrics for a user, including total points earned, claimed balance, and pending rewards.',
  })
  @ApiQuery({
    name: 'userId',
    type: String,
    required: true,
    description: 'User ID to fetch reward metrics for',
    example: 'user-123456',
  })
  @ApiOkResponse({
    description: 'Reward metrics fetched successfully',
    type: SuccessResponseDto,
    schema: {
      example: {
        status: HttpStatus.OK,
        message: 'Reward metrics fetched successfully',
        data: {
          totalPointsEarned: 150,
          claimedBalance: {
            totalRewardsClaimed: 3,
            lastClaimedDate: '24th, June, 2025',
          },
          pendingRewards: {
            pendingRewards: '0.03',
            tokensEarnedToday: '0.03',
            nextClaimDate: '24th, June, 2025',
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid user ID or missing data',
    type: ErrorResponseDto,
    schema: {
      example: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Token balance not found',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error fetching reward metrics',
    type: ErrorResponseDto,
    schema: {
      example: {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error fetching reward metrics',
      },
    },
  })
  async fetchRewardMetrics(@Query() query: RewardMetricsQueryDto) {
    return this.rewardService.fetchRewardMetrics(query.userId);
  }
}
