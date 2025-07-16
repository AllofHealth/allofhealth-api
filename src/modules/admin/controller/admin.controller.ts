import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { ErrorResponseDto, SuccessResponseDto } from '@/shared/dtos/shared.dto';
import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Ip,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
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
  @UseGuards(AuthGuard, AdminGuard)
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
  @UseGuards(AuthGuard, AdminGuard)
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
  @UseGuards(AuthGuard, AdminGuard)
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
  @UseGuards(AuthGuard, AdminGuard)
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
}
