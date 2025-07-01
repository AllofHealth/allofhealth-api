import {
  Body,
  Controller,
  HttpStatus,
  Ip,
  Post,
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
    return this.journalService.addEntryToJournal(ctx);
  }
}
