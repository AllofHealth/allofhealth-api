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
  RejectUserDto,
  SuspendUserDto,
  VerifyPractitionerDto,
  FetchApprovalManagementDataDto,
  DeleteUserDto,
  RevokeSuspensionDto,
  FetchAllBookingsDto,
} from '../dto/admin.dto';
import { AdminGuard } from '../guard/admin.guard';
import { AdminService } from '../service/admin.service';
import { USER_ERROR_MESSAGES } from '@/modules/user/data/user.data';

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

  @Post('revokeSuspension')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Revoke a user suspension (requires admin)' })
  @ApiOkResponse({
    description: ASM.SUSPENSION_LIFTED_SUCCESSFULLY,
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: ASM.SUSPENSION_LIFTED_SUCCESSFULLY,
    },
  })
  @ApiBadRequestResponse({
    description: ASM.USER_NOT_SUSPENDED,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: ASM.USER_NOT_SUSPENDED,
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
    description: AEM.ERROR_REVOKING_SUSPENSION,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: AEM.ERROR_REVOKING_SUSPENSION,
    },
  })
  async revokeSuspension(@Ip() ip: string, @Body() ctx: RevokeSuspensionDto) {
    this.logger.log(`Revoking suspension for user ${ctx.userId} from ${ip}`);
    return await this.adminService.revokeSuspension(ctx.userId);
  }

  @Post('rejectUser')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Reject a user (requires admin)' })
  @ApiOkResponse({
    description: ASM.USER_REJECTED_SUCCESSFULLY,
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: ASM.USER_REJECTED_SUCCESSFULLY,
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
    description: AEM.ERROR_REJECTING_USER,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: AEM.ERROR_REJECTING_USER,
    },
  })
  async rejectUser(@Ip() ip: string, @Body() ctx: RejectUserDto) {
    this.logger.log(`Rejecting user ${ctx.userId} from ${ip}`);
    return await this.adminService.rejectUser(ctx);
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

  @Get('fetchAllUsers')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Fetch all users (requires admin)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'query', required: false })
  @ApiOkResponse({
    description: 'Fetch all users',
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: 'Users fetched successfully',
      data: [
        {
          email: 'user@example.com',
          fullName: 'John User',
          phoneNumber: '+1234567890',
          gender: 'Male',
          profilePicture: 'https://example.com/profile.jpg',
          role: 'PATIENT',
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
      message: USER_ERROR_MESSAGES.ERROR_FETCHING_ALL_USERS,
    },
  })
  async fetchAllUsers(
    @Ip() ip: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sort') sort?: TSort,
    @Query('query') query?: string,
  ) {
    this.logger.log(`Admin fetching all patients from ${ip}`);
    return await this.adminService.fetchAllUsers({
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

  @Get('fetchNonVerifiedEntities')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Fetch approval management data (requires admin)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'filter', required: false })
  @ApiQuery({ name: 'sort', required: false })
  @ApiOkResponse({
    description: ASM.APPROVAL_MANAGEMENT_DATA_FETCHED,
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: ASM.APPROVAL_MANAGEMENT_DATA_FETCHED,
      data: [
        {
          userId: '507f1f77bcf86cd799439011',
          fullName: 'Dr. John Doe',
          userType: 'DOCTOR',
          specialty: 'Cardiology',
          licenseId: 'MD123456',
          createdAt: '01/01/2024',
        },
      ],
      meta: {
        currentPage: 1,
        totalPages: 5,
        totalCount: 50,
        itemsPerPage: 12,
        hasNextPage: true,
        hasPreviousPage: false,
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: AEM.ERROR_FETCHING_APPROVAL_MANAGEMENT_DATA,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: AEM.ERROR_FETCHING_APPROVAL_MANAGEMENT_DATA,
    },
  })
  async fetchApprovalManagementData(
    @Ip() ip: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('filter') filter?: 'DOCTOR' | 'PHARMACIST',
    @Query('sort') sort?: 'ASC' | 'DESC',
  ) {
    this.logger.log(`Admin fetching approval management data from ${ip}`);
    return await this.adminService.fetchApprovalManagementData({
      page,
      limit,
      filter,
      sort,
    });
  }

  @Delete('deleteUser')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Delete a user (requires admin)' })
  @ApiOkResponse({
    description: ASM.USER_DELETED_SUCCESSFULLY,
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: ASM.USER_DELETED_SUCCESSFULLY,
    },
  })
  @ApiBadRequestResponse({
    description: USER_ERROR_MESSAGES.USER_NOT_FOUND,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: USER_ERROR_MESSAGES.USER_NOT_FOUND,
    },
  })
  @ApiInternalServerErrorResponse({
    description: USER_ERROR_MESSAGES.ERROR_DELETING_USER,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: USER_ERROR_MESSAGES.ERROR_DELETING_USER,
    },
  })
  async deleteUser(@Ip() ip: string, @Body() ctx: DeleteUserDto) {
    this.logger.log(`Admin deleting user ${ctx.userId} from ${ip}`);
    return await this.adminService.deleteUser(ctx.userId);
  }

  @Delete('deleteMoodMetrics')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Delete mood metrics for a user (requires admin)' })
  @ApiQuery({
    name: 'userId',
    required: true,
    description: 'User ID whose mood metrics should be deleted',
  })
  @ApiOkResponse({
    description: 'Mood metrics deleted successfully',
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: 'Mood metrics deleted successfully',
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
    description: 'Error deleting mood metrics',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error deleting mood metrics',
    },
  })
  async deleteMoodMetrics(@Ip() ip: string, @Query('userId') userId: string) {
    this.logger.log(
      `Admin deleting mood metrics for user ${userId} from ${ip}`,
    );
    return await this.adminService.deleteMoodMetrics(userId);
  }

  @Delete('deleteUserHealthJournal')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Delete health journal for a user (requires admin)',
  })
  @ApiQuery({
    name: 'userId',
    required: true,
    description: 'User ID whose health journal should be deleted',
  })
  @ApiOkResponse({
    description: 'Health journal deleted successfully',
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: 'Health journal deleted successfully',
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
    description: 'Error deleting health journal',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error deleting health journal',
    },
  })
  async deleteUserHealthJournal(
    @Ip() ip: string,
    @Query('userId') userId: string,
  ) {
    this.logger.log(
      `Admin deleting health journal for user ${userId} from ${ip}`,
    );
    return await this.adminService.deleteUserHealthJournal(userId);
  }

  @Get('fetchNewsletterSubscribers')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Fetch all newsletter subscribers (requires admin)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of subscribers to fetch',
    type: Number,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of subscribers to skip (for pagination)',
    type: Number,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort order for subscribers',
    type: String,
    enum: ['ASC', 'DESC'],
  })
  @ApiOkResponse({
    description: 'Newsletter subscribers fetched successfully',
    type: SuccessResponseDto,
    example: {
      status: 200,
      message: 'Newsletter subscribers fetched successfully',
      data: [
        {
          id: 2,
          emailBlacklisted: false,
          smsBlacklisted: false,
          createdAt: '2025-09-04T18:09:56.375+02:00',
          modifiedAt: '2025-09-04T18:09:56.375+02:00',
          email: 'johndoe@gmail.com',
          listIds: [],
          listUnsubscribed: null,
          attributes: {},
        },
      ],
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error fetching newsletter subscribers',
    type: ErrorResponseDto,
    example: {
      status: 500,
      message: 'Error fetching newsletter subscribers',
    },
  })
  async fetchNewsletterSubscribers(
    @Ip() ip: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('sort') sort?: 'ASC' | 'DESC',
  ) {
    this.logger.log(`Admin fetching newsletter subscribers from ${ip}`);
    return await this.adminService.fetchNewsletterSubscribers({
      limit,
      offset,
      sort,
    });
  }

  @Get('fetchAllBookings')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Fetch all bookings (requires admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: [
      'pending_payment',
      'processing_payment',
      'confirmed',
      'completed',
      'cancelled',
      'no_show',
    ],
  })
  @ApiOkResponse({
    description: 'All bookings retrieved successfully',
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: 'All bookings retrieved successfully',
      data: [
        {
          bookingId: 'c6a9a3b2-c8a7-4b72-9b2a-7c2a7e2a9c3d',
          bookingReference:
            'AOH-TEL-459539GWCRDOP-c6a9a3b2-c8a7-4b72-9b2a-7c2a7e2a9c3d',
          patientId: 'a2a7e2a9-c3d0-4b72-9b2a-7c2a7e2a9c3d',
          doctorId: 'd8a7e2a9-c3d0-4b72-9b2a-7c2a7e2a9c3d',
          patientFullName: 'John Patient',
          doctorFullName: 'Dr. Jane Doe',
          doctorProfilePicture: 'https://example.com/doctor.jpg',
          patientProfilePicture: 'https://example.com/patient.jpg',
          status: 'confirmed',
          videoRoomId: 'vri_12345',
          videoRoomUrl: 'https://doxy.me/aoh/12345',
          startTime: '2025-11-20T10:00:00.000Z',
          endTime: '2025-11-20T10:45:00.000Z',
          price: '5000',
          paymentStatus: 'paid',
          currency: 'NGN',
          paymentIntentId: 'pi_12345',
        },
      ],
      meta: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 1,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error fetching all bookings',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error fetching all bookings',
    },
  })
  async fetchAllBookings(
    @Ip() ip: string,
    @Query() ctx: FetchAllBookingsDto,
  ) {
    this.logger.log(`Admin fetching all bookings from ${ip}`);
    return await this.adminService.fetchAllBookings(ctx);
  }
}
