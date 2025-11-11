import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  HttpStatus,
  Ip,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ConsultationService } from '../service/consultation.service';
import {
  AddNewConsultationTypeDto,
  CreateDoctorConsultationTypeDto,
  GetDoctorConsultationTypesDto,
  UpdateDeleteConsultationTypeQueryDto,
  UpdateDoctorConsultationTypeDto,
} from '../dto/consultation.dto';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { ErrorResponseDto, SuccessResponseDto } from '@/shared/dtos/shared.dto';
import { OwnerGuard } from '@/modules/user/guard/user.guard';

@ApiTags('Consultation Operations')
@ApiBearerAuth()
@Controller('consultation')
export class ConsultationController {
  private readonly logger = new MyLoggerService(ConsultationController.name);

  constructor(private readonly consultationService: ConsultationService) {}

  @Post('addNewConsultationType')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Add a new consultation type' })
  @ApiCreatedResponse({
    description: 'Consultation type added successfully.',
    type: SuccessResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async addNewConsultationType(
    @Ip() ip: string,
    @Body() dto: AddNewConsultationTypeDto,
  ) {
    this.logger.log(
      `Request to add new consultation type with name ${dto.name} from ${ip}`,
    );
    return await this.consultationService.addNewConsultationType(dto.name);
  }

  @Get('allConsultationTypes')
  @ApiOperation({ summary: 'Fetch all consultation types' })
  @ApiOkResponse({
    description: 'Successfully retrieved all consultation types.',
    type: SuccessResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async fetchAllConsultationTypes(@Ip() ip: string) {
    this.logger.log(`Request to fetch all consultation types from ${ip}`);
    return await this.consultationService.fetchAllConsultationTypes();
  }

  @Post('createDoctorConsultationType')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a new consultation type for a doctor' })
  @ApiCreatedResponse({
    description: 'Consultation type created successfully.',
    type: SuccessResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async createDoctorConsultationType(
    @Ip() ip: string,
    @Body() dto: CreateDoctorConsultationTypeDto,
  ) {
    this.logger.log(
      `Request to create consultation type for doctor ${dto.userId} from ${ip}`,
    );
    return await this.consultationService.createDoctorConsultationType({
      ...dto,
      doctorId: dto.userId,
    });
  }

  @Get('allDoctorConsultationTypes')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Get a doctor's consultation types" })
  @ApiOkResponse({
    description: 'Successfully retrieved consultation types.',
    type: SuccessResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async getDoctorConsultationTypes(
    @Ip() ip: string,
    @Query() dto: GetDoctorConsultationTypesDto,
  ) {
    this.logger.log(
      `Request to get consultation types for doctor ${dto.userId} from ${ip}`,
    );
    return await this.consultationService.getDoctorConsultationTypes({
      doctorId: dto.userId,
      activeOnly: dto.activeOnly,
    });
  }

  @Get('fetchDoctorConsultationTypeById')
  @UseGuards(AuthGuard, OwnerGuard)
  @ApiOperation({ summary: 'Get a consultation type by ID' })
  @ApiOkResponse({
    description: 'Successfully retrieved consultation type.',
    type: SuccessResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Consultation type not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async getConsultationTypeById(
    @Ip() ip: string,
    @Query() ctx: UpdateDeleteConsultationTypeQueryDto,
  ) {
    this.logger.log(`Request to get consultation type ${ctx.id} from ${ip}`);
    return await this.consultationService.findById(ctx.id);
  }

  @Patch('updateDoctorConsultationType')
  @UseGuards(AuthGuard, OwnerGuard)
  @ApiOperation({ summary: 'Update a consultation type' })
  @ApiQuery({ type: UpdateDeleteConsultationTypeQueryDto })
  @ApiOkResponse({
    description: 'Successfully updated consultation type.',
    type: SuccessResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Consultation type not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async updateDoctorConsultationType(
    @Ip() ip: string,
    @Body() ctx: UpdateDoctorConsultationTypeDto,
  ) {
    this.logger.log(`Request to update consultation type ${ctx.id} from ${ip}`);
    return await this.consultationService.updateDoctorConsultationType({
      id: ctx.id,
      data: {
        description: ctx.description,
        durationMinutes: ctx.durationMinutes,
        isActive: ctx.isActive,
        price: ctx.price,
      },
    });
  }

  @Delete('deleteDoctorConsultationTypeById')
  @UseGuards(AuthGuard, OwnerGuard)
  @ApiOperation({ summary: 'Delete a consultation type' })
  @ApiBody({ type: UpdateDeleteConsultationTypeQueryDto })
  @ApiOkResponse({
    description: 'Successfully deleted consultation type.',
    type: SuccessResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Consultation type not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async deleteDoctorConsultationType(
    @Ip() ip: string,
    @Body() ctx: UpdateDeleteConsultationTypeQueryDto,
  ) {
    this.logger.log(`Request to delete consultation type ${ctx.id} from ${ip}`);
    return await this.consultationService.deleteDoctorConsultationType(ctx.id);
  }
}
