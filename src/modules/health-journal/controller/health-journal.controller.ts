import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Ip,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { HealthJournalService } from '../service/health-journal.service';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { OwnerGuard } from '@/modules/user/guard/user.guard';
import { AddEntryDto } from '../dto/health-journal.dto';
import {
  HealthJournalErrorMessages as HEM,
  HealthJournalSuccessMessages as HSM,
} from '../data/health-journal.data';
import { ErrorResponseDto, SuccessResponseDto } from '@/shared/dtos/shared.dto';
import { TDuration } from '../interface/health-journal.interface';

@ApiTags('Journal Operations')
@Controller('health-journal')
export class HealthJournalController {
  private readonly logger = new MyLoggerService(HealthJournalController.name);
  constructor(private readonly journalService: HealthJournalService) {}

  @Post('addJournalEntry')
  @UseGuards(AuthGuard, OwnerGuard)
  @ApiOperation({ summary: 'Add a journal entry' })
  @ApiOkResponse({
    description: HSM.SUCCESS_ADDING_ENTRY,
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: HSM.SUCCESS_ADDING_ENTRY,
    },
  })
  @ApiBadRequestResponse({
    description: HEM.ERROR_ADDING_ENTRY,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: HEM.ERROR_ADDING_ENTRY,
    },
  })
  async addJournalEntry(@Ip() ip: string, @Body() ctx: AddEntryDto) {
    this.logger.log(`Journal entry for ${ctx.userId} from ${ip}`);
    return await this.journalService.addEntryToJournal(ctx);
  }

  @Get('fetchUserJournals')
  @UseGuards(AuthGuard, OwnerGuard)
  @ApiOperation({ summary: 'Fetch user journals' })
  @ApiOkResponse({
    description: HSM.SUCCESS_FETCHING_JOURNAL,
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      data: {
        id: '1234555',
        userId: '12345',
        mood: 'great',
        symptoms: ['headache', 'fatigue'],
        activities: ['running', 'reading'],
        tags: ['work', 'family'],
        createdAt: '20/08/2025',
        updatedAt: '20/08/2025',
      },
      meta: {
        currentPage: 1,
        limit: 12,
        totalCount: 24,
        itemsPerPage: 12,
        hasNextPage: true,
        hasPreviousPage: false,
      },
    },
  })
  @ApiBadRequestResponse({
    description: HEM.ERROR_FETCHING_JOURNAL,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: HEM.ERROR_FETCHING_JOURNAL,
    },
  })
  async fetchUserJournals(
    @Ip() ip: string,
    @Query('userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    this.logger.log(`Fetching journals for ${userId} from ${ip}`);
    return await this.journalService.fetchUserJournals({
      userId,
      page,
      limit,
    });
  }

  @Get('fetchJournalMetrics')
  @UseGuards(AuthGuard, OwnerGuard)
  @ApiOperation({
    summary: 'Fetch health journal metrics',
    description:
      'Fetch monthly or yearly mood metrics. For monthly, returns mood data for a specific month. For yearly, returns up to 12 years of aggregated mood data.',
  })
  @ApiQuery({
    name: 'userId',
    required: true,
    type: String,
    description: 'User ID to fetch metrics for',
  })
  @ApiQuery({
    name: 'duration',
    required: true,
    enum: ['monthly', 'yearly'],
    description: 'Duration type for metrics (monthly or yearly)',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    description:
      'Year for metrics. For yearly duration, limits results to max 12 years from current',
  })
  @ApiOkResponse({
    description:
      HSM.SUCCESS_FETCHING_JOURNAL_METRICS ||
      'Journal metrics fetched successfully',
    type: SuccessResponseDto,
    examples: {
      monthly: {
        summary: 'Returns monthly journal metrics',
        value: {
          status: HttpStatus.OK,
          message: 'Journal metrics fetched successfully',
          data: [
            {
              month: 'Feb',
              averageMoodLevel: 'good',
            },
          ],
        },
      },
      yearly: {
        summary: 'Returns yearly journal metrics',
        value: {
          status: HttpStatus.OK,
          message: 'Journal metrics fetched successfully',
          data: [
            {
              year: 2024,
              averageMoodLevel: 'good',
            },
            {
              year: 2023,
              averageMoodLevel: 'neutral',
            },
          ],
          summary: {
            totalYears: 12,
            yearsWithData: 5,
            overallAverageMood: 'good',
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: HEM.ERROR_FETCHING_HEALTH_JOURNAL_METRICS,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: HEM.ERROR_FETCHING_HEALTH_JOURNAL_METRICS,
    },
  })
  async fetchJournalMetrics(
    @Ip() ip: string,
    @Query('userId') userId: string,
    @Query('duration') duration: TDuration,
    @Query('year') year?: number,
  ) {
    this.logger.log(
      `Fetching ${duration} journal metrics for ${userId} from ${ip}`,
    );

    const parsedYear = year ? Number(year) : undefined;

    return await this.journalService.fetchJournalMetrics({
      userId,
      duration,
      year: parsedYear,
    });
  }
}
