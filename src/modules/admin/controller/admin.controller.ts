import { TSort } from '@/modules/doctor/interface/doctor.interface';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { ErrorResponseDto, SuccessResponseDto } from '@/shared/dtos/shared.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Ip,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  ADMIN_ERROR_MESSAGES as AEM,
  ADMIN_SUCCESS_MESSAGES as ASM,
} from '../data/admin.data';
import {
  AdminLoginDto,
  CreateSuperAdminDto,
  CreateSystemAdminDto,
  DeleteAdminDto,
  ManagePermissionsDto,
  SuspendUserDto,
  VerifyPractitionerDto,
} from '../dto/admin.dto';
import { AdminGuard } from '../guard/admin.guard';
import { AdminService } from '../service/admin.service';

@ApiTags('Admin Operations')
@Controller('admin')
export class AdminController {
  private readonly logger = new MyLoggerService(AdminController.name);
  constructor(private readonly adminService: AdminService) {}

  @Post('createSuperAdmin')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Create a new super admin' })
  @ApiOkResponse({
    description: ASM.SUPER_ADMIN_CREATED,
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: ASM.SUPER_ADMIN_CREATED,
      data: {
        adminId: '507f1f77bcf86cd799439011',
        userName: 'superadmin01',
        email: 'superadmin@allofhealth.com',
        permissionLevel: 'super',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: AEM.ADMIN_EXISTS,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: AEM.ADMIN_EXISTS,
    },
  })
  @ApiInternalServerErrorResponse({
    description: AEM.ERROR_CREATING_ADMIN,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: AEM.ERROR_CREATING_ADMIN,
    },
  })
  async createSuperAdmin(@Ip() ip: string, @Body() ctx: CreateSuperAdminDto) {
    this.logger.log(`Creating super admin ${ctx.userName} from ${ip}`);
    return await this.adminService.createSuperAdmin(ctx);
  }

  @Post('createSystemAdmin')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Create a new system admin (requires super admin)' })
  @ApiOkResponse({
    description: ASM.SUCCESS_CREATING_ADMIN,
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: ASM.SUCCESS_CREATING_ADMIN,
    },
  })
  @ApiBadRequestResponse({
    description: AEM.ADMIN_EXISTS,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: AEM.ADMIN_EXISTS,
    },
  })
  @ApiBadRequestResponse({
    description: AEM.ERROR_VALIDATING_SUPER_ADMIN,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: AEM.ERROR_VALIDATING_SUPER_ADMIN,
    },
  })
  @ApiInternalServerErrorResponse({
    description: AEM.ERROR_CREATING_ADMIN,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: AEM.ERROR_CREATING_ADMIN,
    },
  })
  async createSystemAdmin(@Ip() ip: string, @Body() ctx: CreateSystemAdminDto) {
    this.logger.log(
      `Super admin ${ctx.userId} creating system admin ${ctx.userName} from ${ip}`,
    );
    return await this.adminService.createSystemAdmin({
      ...ctx,
      superAdminId: ctx.userId,
    });
  }

  @Post('managePermissions')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Manage admin permissions (requires super admin)' })
  @ApiOkResponse({
    description: ASM.SUCCESS_UPDATING_ADMIN_PERMISSIONS,
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: ASM.SUCCESS_UPDATING_ADMIN_PERMISSIONS,
    },
  })
  @ApiBadRequestResponse({
    description: AEM.ADMIN_NOT_FOUND,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: AEM.ADMIN_NOT_FOUND,
    },
  })
  @ApiBadRequestResponse({
    description: AEM.ERROR_VALIDATING_SUPER_ADMIN,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: AEM.ERROR_VALIDATING_SUPER_ADMIN,
    },
  })
  @ApiInternalServerErrorResponse({
    description: AEM.ERROR_UPDATING_ADMIN_PERMISSIONS,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: AEM.ERROR_UPDATING_ADMIN_PERMISSIONS,
    },
  })
  async managePermissions(@Ip() ip: string, @Body() ctx: ManagePermissionsDto) {
    this.logger.log(
      `Super admin ${ctx.userId} updating permissions for admin ${ctx.adminId} to ${ctx.permissionLevel} from ${ip}`,
    );
    return await this.adminService.managePermissions({
      ...ctx,
      superAdminId: ctx.userId,
    });
  }

  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  @ApiOkResponse({
    description: ASM.SUCCESS_LOGGING_IN_AS_ADMIN,
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: ASM.SUCCESS_LOGGING_IN_AS_ADMIN,
      data: {
        id: '507f1f77bcf86cd799439011',
        email: 'admin@allofhealth.com',
        permissionLevel: 'super',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiBadRequestResponse({
    description: AEM.ADMIN_NOT_FOUND,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: AEM.ADMIN_NOT_FOUND,
    },
  })
  @ApiBadRequestResponse({
    description: AEM.INVALID_ADMIN_PASSWORD,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: AEM.INVALID_ADMIN_PASSWORD,
    },
  })
  @ApiInternalServerErrorResponse({
    description: AEM.ERROR_LOGGING_IN_AS_ADMIN,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: AEM.ERROR_LOGGING_IN_AS_ADMIN,
    },
  })
  async adminLogin(@Ip() ip: string, @Body() ctx: AdminLoginDto) {
    this.logger.log(`Admin login attempt for ${ctx.email} from ${ip}`);
    return await this.adminService.adminLogin(ctx);
  }

  @Post('verifyPractitioner')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Verify a practitioner (requires admin)' })
  @ApiOkResponse({
    description: ASM.PRACTITIONER_VERIFIED,
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: ASM.PRACTITIONER_VERIFIED,
    },
  })
  @ApiBadRequestResponse({
    description: 'Practitioner not found',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: 'Practitioner not found',
    },
  })
  @ApiBadRequestResponse({
    description: AEM.ERROR_VALIDATING_SUPER_ADMIN,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: AEM.ERROR_VALIDATING_SUPER_ADMIN,
    },
  })
  @ApiInternalServerErrorResponse({
    description: AEM.ERROR_VERIFYING_PRACTITIONER,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: AEM.ERROR_VERIFYING_PRACTITIONER,
    },
  })
  async verifyPractitioner(
    @Ip() ip: string,
    @Body() ctx: VerifyPractitionerDto,
  ) {
    this.logger.log(`Verifying ${ctx.role} ${ctx.practitionerId} from ${ip}`);
    return await this.adminService.verifyPractitioner(ctx);
  }

  @Delete('deleteAdmin')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Delete an admin (requires super admin)' })
  @ApiOkResponse({
    description: ASM.SUCCESS_DELETING_ADMIN,
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: ASM.SUCCESS_DELETING_ADMIN,
    },
  })
  @ApiBadRequestResponse({
    description: AEM.ADMIN_NOT_FOUND,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: AEM.ADMIN_NOT_FOUND,
    },
  })
  @ApiBadRequestResponse({
    description: AEM.ERROR_VALIDATING_SUPER_ADMIN,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: AEM.ERROR_VALIDATING_SUPER_ADMIN,
    },
  })
  @ApiInternalServerErrorResponse({
    description: AEM.ERROR_DELETING_ADMIN,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: AEM.ERROR_DELETING_ADMIN,
    },
  })
  async deleteAdmin(@Ip() ip: string, @Body() ctx: DeleteAdminDto) {
    this.logger.log(
      `Super admin ${ctx.userId} deleting admin ${ctx.adminId} from ${ip}`,
    );
    return await this.adminService.deleteAdmin({
      ...ctx,
      superAdminId: ctx.userId,
    });
  }

  @Post('suspendUser')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Suspend a user (requires admin)' })
  @ApiOkResponse({
    description: ASM.USER_SUSPENDED_SUCCESSFULLY,
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: ASM.USER_SUSPENDED_SUCCESSFULLY,
    },
  })
  @ApiOkResponse({
    description: ASM.USER_ALREADY_SUSPENDED,
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: ASM.USER_ALREADY_SUSPENDED,
    },
  })
  @ApiBadRequestResponse({
    description: 'User not found',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: 'User not found',
    },
  })
  @ApiInternalServerErrorResponse({
    description: AEM.ERROR_SUSPENDING_USER,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: AEM.ERROR_SUSPENDING_USER,
    },
  })
  async suspendUser(@Ip() ip: string, @Body() ctx: SuspendUserDto) {
    this.logger.log(`Suspending user ${ctx.userId} from ${ip}`);
    return await this.adminService.suspendUser(ctx);
  }

  @Get('dashboard/patient-management')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Fetch patient management dashboard data (requires admin)',
  })
  @ApiOkResponse({
    description: ASM.PATIENT_MANAGEMENT_DASHBOARD_FETCHED,
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: ASM.PATIENT_MANAGEMENT_DASHBOARD_FETCHED,
      data: {
        totalActiveUsers: 150,
        totalPatients: 1200,
        totalDoctors: 45,
        totalSuspendedUsers: 8,
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: AEM.ERROR_FETCHING_PATIENT_MANAGEMENT_DASHBOARD,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: AEM.ERROR_FETCHING_PATIENT_MANAGEMENT_DASHBOARD,
    },
  })
  async fetchPatientManagementDashboard(@Ip() ip: string) {
    this.logger.log(`Fetching patient management dashboard from ${ip}`);
    return await this.adminService.fetchPatientManagementDashboardData();
  }

  @Get('fetchAllDoctors')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Fetch all doctors (requires admin)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'query', required: false })
  @ApiOkResponse({
    description: 'Fetch all doctors',
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: 'Doctors fetched successfully',
      data: [
        {
          email: 'doctor@example.com',
          fullName: 'Dr. John Doe',
          phoneNumber: '+1234567890',
          gender: 'Male',
          profilePicture: 'https://example.com/profile.jpg',
          role: 'doctor',
          userId: '507f1f77bcf86cd799439011',
          status: 'active',
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
      message: AEM.ERROR_FETCHING_PATIENT_MANAGEMENT_DASHBOARD,
    },
  })
  async fetchAllDoctors(
    @Ip() ip: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sort') sort?: TSort,
    @Query('query') query?: string,
  ) {
    this.logger.log(`Admin fetching all doctors from ${ip}`);
    return await this.adminService.fetchAllDoctors({
      page,
      limit,
      sort,
      query,
    });
  }

  @Get('fetchAllPatients')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Fetch all patients (requires admin)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'query', required: false })
  @ApiOkResponse({
    description: 'Fetch all patients',
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: 'Patients fetched successfully',
      data: [
        {
          email: 'patient@example.com',
          fullName: 'John Patient',
          phoneNumber: '+1234567890',
          gender: 'Male',
          profilePicture: 'https://example.com/profile.jpg',
          role: 'patient',
          userId: '507f1f77bcf86cd799439011',
          status: 'active',
        },
      ],
      meta: {
        currentPage: 1,
        totalCount: 150,
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
      message: AEM.ERROR_FETCHING_PATIENT_MANAGEMENT_DASHBOARD,
    },
  })
  async fetchAllPatients(
    @Ip() ip: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sort') sort?: TSort,
    @Query('query') query?: string,
  ) {
    this.logger.log(`Admin fetching all patients from ${ip}`);
    return await this.adminService.fetchAllPatients({
      page,
      limit,
      sort,
      query,
    });
  }

  @Get('fetchUserData')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Fetch user data by user ID (requires admin)' })
  @ApiQuery({
    name: 'userId',
    required: true,
    description: 'User ID to fetch data for',
  })
  @ApiOkResponse({
    description: ASM.USER_DATA_FETCHED,
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: ASM.USER_DATA_FETCHED,
      data: {
        userId: '507f1f77bcf86cd799439011',
        fullName: 'John Doe',
        profilePicture: 'https://example.com/profile.jpg',
        emailAddress: 'john@example.com',
        phoneNumber: '+1234567890',
        gender: 'Male',
        status: 'active',
        lastActive: '2024-01-15 10:30 AM',
        dateJoined: '2024-01-01 12:00 PM',
        dob: '1990-01-01',
        role: 'PATIENT',
        identityAssets: {
          governmentIdUrl: 'https://example.com/gov-id.jpg',
        },
        patientActivity: {
          appointmentsBooked: 5,
          medicalRecordsCreated: 3,
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'User not found',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: 'Patient not found',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error fetching user data',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error fetching patient data',
    },
  })
  async fetchUserData(@Ip() ip: string, @Query('userId') userId: string) {
    this.logger.log(`Admin fetching user data for ${userId} from ${ip}`);
    return await this.adminService.fetchUserData(userId);
  }
}
