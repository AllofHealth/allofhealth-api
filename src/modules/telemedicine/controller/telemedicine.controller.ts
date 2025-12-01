import {
  Controller,
  Get,
  HttpStatus,
  Ip,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TelemedicineService } from '../service/telemedicine.service';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import {
  CheckSlotAvailabilityDto,
  GetCalComEmbedConfigDto,
  GetDoctorAvailabilityDto,
  GetDoctorConsultationTypesDto,
} from '../dto/telemedicine.dto';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { ErrorResponseDto, SuccessResponseDto } from '@/shared/dtos/shared.dto';

@ApiTags('Telemedicine Operations')
@Controller('telemedicine')
export class TelemedicineController {
  private readonly logger = new MyLoggerService(TelemedicineController.name);
  constructor(private readonly telemedicineService: TelemedicineService) {}

  @Get('doctor-availability')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: "Get a doctor's availability",
    description:
      'Retrieves the available time slots for a specific doctor and consultation type within a given date range.',
  })
  @ApiOkResponse({
    description: 'Doctor availability retrieved successfully.',
    type: SuccessResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Consultation type not found.',
    type: ErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Consultation type not linked to a Cal.com event.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized to perform this action.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occurred.',
    type: ErrorResponseDto,
  })
  async getDoctorAvailability(
    @Ip() ip: string,
    @Query() ctx: GetDoctorAvailabilityDto,
  ) {
    this.logger.log(
      `Get doctor availability request from ${ip} for doctor ${ctx.userId}`,
    );
    return await this.telemedicineService.getDoctorAvailability({
      doctorId: ctx.userId,
      consultationTypeId: ctx.consultationTypeId,
      startDate: new Date(ctx.startDate),
      endDate: new Date(ctx.endDate),
    });
  }

  @Get('doctor-consultation-types')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: "Get a doctor's consultation types",
    description:
      'Retrieves all consultation types offered by a specific doctor.',
  })
  @ApiOkResponse({
    description: 'Doctor consultation types retrieved successfully.',
    type: SuccessResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized to perform this action.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occurred.',
    type: ErrorResponseDto,
  })
  async getDoctorConsultationTypes(
    @Ip() ip: string,
    @Query() ctx: GetDoctorConsultationTypesDto,
  ) {
    this.logger.log(
      `Get doctor consultation types request from ${ip} for doctor ${ctx.userId}`,
    );
    return await this.telemedicineService.getDoctorConsultationTypes({
      doctorId: ctx.userId,
      activeOnly: ctx.activeOnly,
    });
  }

  @Get('check-slot-availability')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Check if a specific time slot is available',
    description:
      'Verifies if a specific time slot is available for a given doctor and consultation type.',
  })
  @ApiOkResponse({
    description: 'Slot availability checked successfully.',
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: 'Slot is available.',
      data: { available: true },
    },
  })
  @ApiNotFoundResponse({
    description: 'Doctor availability not found.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized to perform this action.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occurred.',
    type: ErrorResponseDto,
  })
  async checkSlotAvailability(
    @Ip() ip: string,
    @Query() ctx: CheckSlotAvailabilityDto,
  ) {
    this.logger.log(
      `Check slot availability request from ${ip} for doctor ${ctx.userId} at ${ctx.startTime}`,
    );
    const isAvailable = await this.telemedicineService.checkSlotAvailability({
      doctorId: ctx.userId,
      consultationTypeId: ctx.consultationTypeId,
      startTime: new Date(ctx.startTime),
    });
    return {
      status: HttpStatus.OK,
      message: isAvailable ? 'Slot is available.' : 'Slot is not available.',
      data: { available: isAvailable },
    };
  }

  @Get('calcom-embed-config')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get Cal.com embed configuration',
    description:
      'Retrieves the necessary configuration to embed the Cal.com booking calendar for a specific consultation type.',
  })
  @ApiOkResponse({
    description: 'Cal.com embed config retrieved successfully.',
    type: SuccessResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Consultation type not found.',
    type: ErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Consultation type not configured for bookings.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized to perform this action.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occurred.',
    type: ErrorResponseDto,
  })
  async getCalComEmbedConfig(
    @Ip() ip: string,
    @Query() ctx: GetCalComEmbedConfigDto,
  ) {
    this.logger.log(
      `Get Cal.com embed config request from ${ip} for consultation type ${ctx.consultationTypeId}`,
    );
    return await this.telemedicineService.getCalComEmbedConfig({
      consultationTypeId: ctx.consultationTypeId,
    });
  }
}
