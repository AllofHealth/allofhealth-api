import {
  Controller,
  Get,
  HttpStatus,
  Ip,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { ErrorResponseDto, SuccessResponseDto } from '@/shared/dtos/shared.dto';
import {
  DOCTOR_ERROR_MESSGAES as DEM,
  DOCTOR_SUCCESS_MESSAGES as DSM,
} from '../data/doctor.data';
import { DoctorService } from '../service/doctor.service';
import { TSort } from '../interface/doctor.interface';

@ApiTags('Doctor Operations')
@Controller('doctor')
export class DoctorController {
  private readonly logger = new MyLoggerService(DoctorController.name);
  constructor(private readonly doctorSevice: DoctorService) {}

  @Get('fetchDoctor')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Fetch a doctor by ID' })
  @ApiQuery({ name: 'userId', required: true })
  @ApiOkResponse({
    description: 'Fetch all doctors',
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: DSM.DOCTOR_FETCHED,
      data: {
        userId: '',
        fullName: '',
        email: '',
        gender: '',
        profilePicture: '',
        role: '',
        certifications: '',
        hospitalAssociation: '',
        specialization: '',
        languagesSpoken: '',
        locationOfHospital: '',
        medicalLicenseNumber: '',
        yearsOfExperience: '',
        availability: '',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: DEM.DOCTOR_NOT_FOUND,
    },
  })
  async fetchDoctor(@Ip() ip: string, @Query('userId') userId: string) {
    this.logger.log(`Fetch doctor request for ${userId} from ${ip}`);
    return await this.doctorSevice.fetchDoctor(userId);
  }

  @Get('fetchAllDoctors')
  @ApiOperation({ summary: 'Fetch all doctors' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'query', required: false })
  @ApiOkResponse({
    description: 'Fetch all doctors',
    type: Array,
    example: {
      status: HttpStatus.OK,
      message: DSM.DOCTOR_FETCHED,
      data: [
        {
          userId: '',
          fullName: '',
          email: '',
          gender: '',
          profilePicture: '',
          role: '',
          certifications: '',
          hospitalAssociation: '',
          specialization: '',
          languagesSpoken: '',
          locationOfHospital: '',
          medicalLicenseNumber: '',
          yearsOfExperience: '',
          availability: '',
        },
      ],
      meta: {
        currentPage: 1,
        totalCount: 24,
        itemsPerPage: 12,
        hasNextPage: true,
        hasPreviousPage: false,
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: DEM.DOCTOR_NOT_FOUND,
    },
  })
  async fetchAllDoctors(
    @Ip() ip: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sort') sort?: TSort,
    @Query('query') query?: string,
  ) {
    this.logger.log(`Fetch doctor request from ${ip}`);
    return await this.doctorSevice.fetchAllDoctors({
      page,
      limit,
      sort,
      query,
    });
  }
}
