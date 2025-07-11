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
}
