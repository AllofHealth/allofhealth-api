import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { ErrorResponseDto, SuccessResponseDto } from '@/shared/dtos/shared.dto';
import {
  AVAILABILITY_ERROR_MESSAGE as AEM,
  AVAILABILITY_SUCCESS_MESSAGE as ASM,
} from '../data/availability.data';
import { AvailabilityService } from '../service/availability.service';
import { CreateAvailabilityDto } from '../dto/availability.dto';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { OwnerGuard } from '@/modules/user/guard/user.guard';

@ApiTags('Availability Operations')
@Controller('availability')
export class AvailabilityController {
  private readonly logger = new MyLoggerService(AvailabilityController.name);

  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post('createAvailability')
  @UseGuards(AuthGuard, OwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create availability for a doctor' })
  @ApiOkResponse({
    description: 'Availability created successfully',
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: ASM.SUCCESS_CREATING_AVAILABILITY,
    },
  })
  @ApiForbiddenResponse({
    description: 'Forbidden resource',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.FORBIDDEN,
      message: 'Forbidden resource',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: AEM.ERROR_CREATING_AVAILABILITY,
    },
  })
  async createAvailability(
    @Ip() ip: string,
    @Body() ctx: CreateAvailabilityDto,
  ) {
    this.logger.log(
      `Creating availability for doctor ${ctx.userId} from ip: ${ip}`,
    );

    return await this.availabilityService.createAvailability({
      doctorId: ctx.userId,
      availabilityConfig: ctx.availabilityConfig,
    });
  }
}
