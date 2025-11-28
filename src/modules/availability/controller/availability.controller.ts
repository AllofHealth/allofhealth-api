import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { ErrorResponseDto, SuccessResponseDto } from '@/shared/dtos/shared.dto';
import {
  AVAILABILITY_ERROR_MESSAGE as AEM,
  AVAILABILITY_SUCCESS_MESSAGE as ASM,
} from '../data/availability.data';
import { AvailabilityService } from '../service/availability.service';
import {
  CreateAvailabilityDto,
  FetchDoctorAvailabilityDto,
  UpdateDoctorAvailabilityDto,
} from '../dto/availability.dto';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { OwnerGuard } from '@/modules/user/guard/user.guard';

@ApiTags('Availability Operations')
@Controller('availability')
export class AvailabilityController {
  private readonly logger = new MyLoggerService(AvailabilityController.name);

  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get('fetchDoctorAvailability')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Fetch a doctor's availability" })
  @ApiQuery({ name: 'userId', required: true, type: String })
  @ApiOkResponse({
    description: 'Availability fetched successfully',
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: ASM.SUCCESS_FETCHING_AVAILABILITY,
      data: [
        {
          id: 'c2d1b0a8-0b9c-4a1a-8e0a-4b0c0e1a2b3c',
          doctorId: '550e8400-e29b-41d4-a716-446655440000',
          weekDay: 'MONDAY',
          startTime: '09:00 AM',
          endTime: '05:00 PM',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: 'No availability found for this doctor',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.NOT_FOUND,
      message: 'No availability has been configured for this doctor',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: AEM.ERROR_FETCHING_AVAILABILITY,
    },
  })
  async fetchDoctorAvailability(
    @Ip() ip: string,
    @Query() query: FetchDoctorAvailabilityDto,
  ) {
    this.logger.log(
      `Fetching availability for doctor ${query.userId} from ip: ${ip}`,
    );

    return await this.availabilityService.fetchDoctorAvailability(query.userId);
  }

  @Patch('updateDoctorAvailability')
  @UseGuards(AuthGuard, OwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a doctor's availability" })
  @ApiOkResponse({
    description: 'Availability updated successfully',
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: ASM.SUCCESS_UPDATING_AVAILABILITY,
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
      message: AEM.ERROR_UPDATING_AVAILABILITY,
    },
  })
  async updateDoctorAvailability(
    @Ip() ip: string,
    @Body() body: UpdateDoctorAvailabilityDto,
  ) {
    this.logger.log(
      `Updating availability for doctor ${body.userId} from ip: ${ip}`,
    );
    return await this.availabilityService.updateDoctorAvailability({
      doctorId: body.userId,
      availabilityConfig: body.availabilityConfig,
    });
  }

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
