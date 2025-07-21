import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Ip,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { SuccessResponseDto } from '@/shared/dtos/shared.dto';
import {
  USER_ERROR_MESSAGES as UEM,
  USER_SUCCESS_MESSAGE as USM,
} from '../data/user.data';
import { ResendOtpDto, UpdateUserDto } from '../dto/user.dto';
import { UserError } from '../error/user.error';
import { OwnerGuard } from '../guard/user.guard';
import { UserService } from '../service/user.service';
import { ESendOtp } from '@/shared/dtos/event.dto';

@ApiTags('User Operations')
@Controller('user')
export class UserController {
  private readonly logger = new MyLoggerService(UserController.name);
  constructor(private readonly userService: UserService) {}

  @Get('dashboard')
  @UseGuards(AuthGuard, OwnerGuard)
  @ApiOperation({
    summary: 'Fetch user dashboard data',
    description:
      'Returns different data structure based on user role (PATIENT or DOCTOR)',
  })
  @ApiOkResponse({
    description: 'Dashboard data fetched successfully',
    type: SuccessResponseDto,
    examples: {
      patient: {
        summary: 'Patient Dashboard Response',
        value: {
          status: 200,
          message: 'Dashboard data fetched successfully',
          data: {
            userId: '1234567890',
            fullName: 'John Doe',
            email: 'john.doe@example.com',
            gender: 'Male',
            profilePicture: 'profile-picture-url',
            role: 'PATIENT',
            dob: '22 years',
            updatedAt: '24th February, 2025',
            walletData: {
              walletAddress: '0x1234...5678',
              balance: '100.00',
              lastTransactionDate: '2025-02-24T10:30:00Z',
            },
          },
        },
      },
      doctor: {
        summary: 'Doctor Dashboard Response',
        value: {
          status: 200,
          message: 'Dashboard data fetched successfully',
          data: {
            userId: '1234567890',
            fullName: 'Dr. Jane Smith',
            email: 'jane.smith@example.com',
            gender: 'Female',
            profilePicture: 'profile-picture-url',
            role: 'DOCTOR',
            dob: '35 years',
            updatedAt: '24th February, 2025',
            walletData: {
              walletAddress: '0x1234...5678',
              balance: '100.00',
              lastTransactionDate: '2025-02-24T10:30:00Z',
            },
            pendingApprovals: 5,
            totalReward: '0.5',
            dailyTaskCompletion: 0,
          },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: UserError,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: UEM.ERROR_FETCHING_USER,
    },
  })
  async fetchDashboardData(@Ip() ip: string, @Query('userId') userId: string) {
    this.logger.log(`Fetching dashboard data for user ${userId} from ${ip}`);
    return this.userService.fetchDashboardData(userId);
  }

  @Post('resend-otp')
  @ApiOperation({
    summary: 'Resend OTP to user email',
    description: 'Resends OTP verification code to the specified email address',
  })
  @ApiBody({
    description: 'Email address to resend OTP to',
    type: ResendOtpDto,
  })
  @ApiOkResponse({
    description: 'OTP resent successfully',
    type: SuccessResponseDto,
    example: {
      status: 200,
      message: USM.SUCCESS_SENDING_OTP,
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid email address',
    type: UserError,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: 'Invalid email address',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error sending OTP',
    type: UserError,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: UEM.ERROR_SENDING_EMAIL,
    },
  })
  async resendOtp(@Ip() ip: string, @Body() ctx: ResendOtpDto) {
    this.logger.log(`Resending OTP to email ${ctx.email} from ${ip}`);
    const sendOtpEvent = new ESendOtp(ctx.email);
    return this.userService.resendOtp(sendOtpEvent);
  }

  @Put('updateUser')
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            file.fieldname + '-' + uniqueSuffix + extname(file.originalname),
          );
        },
      }),
    }),
  )
  @UseGuards(AuthGuard, OwnerGuard)
  @ApiOperation({ summary: 'Updates an existing user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'User update data with optional profile picture',
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'The users identifier',
          example: '1234567890',
        },
        fullName: {
          type: 'string',
          description: 'The full name of the user',
          example: 'John Doe',
        },
        emailAddress: {
          type: 'string',
          format: 'email',
          description: 'The email address of the user',
          example: 'john.doe@example.com',
        },
        dateOfBirth: {
          type: 'string',
          format: 'date',
          description: 'The date of birth of the user',
          example: '1990-01-01',
        },
        gender: {
          type: 'string',
          description: 'The gender of the user',
          example: 'Male',
        },
        phoneNumber: {
          type: 'string',
          description: 'The phone number of the user',
          example: '+1234567890',
        },
        password: {
          type: 'string',
          description: 'The password of the user',
          example: 'password123',
        },
        specialization: {
          type: 'string',
          description: 'The specialization of the doctor',
          example: 'Cardiologist',
        },
        medicalLicenseNumber: {
          type: 'string',
          description: 'The medical license number of the doctor',
          example: '123456789',
        },
        hospitalAssociation: {
          type: 'string',
          description: 'The hospital association of the doctor',
          example: 'Association 1',
        },
        locationOfHospital: {
          type: 'string',
          description: 'The location of the hospital of the doctor',
          example: 'Location 1',
        },
        profilePicture: {
          type: 'string',
          format: 'binary',
          description: 'Profile picture file (optional)',
        },
      },
      required: ['userId'],
    },
  })
  @ApiOkResponse({
    description: 'User updated successfully',
    type: SuccessResponseDto,
    example: {
      status: 200,
      message: USM.USER_UPDATED,
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: UserError,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: UEM.ERROR_UPDATING_USER,
    },
  })
  @ApiConflictResponse({
    description: UEM.EMAIL_EXIST,
    example: {
      status: HttpStatus.CONFLICT,
      message: UEM.EMAIL_EXIST,
    },
  })
  @ApiBadRequestResponse({
    description: UEM.INVALID_ROLE,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: UEM.INVALID_ROLE,
    },
  })
  async updateUser(
    @Ip() ip: string,
    @UploadedFile() profilePicture: Express.Multer.File,
    @Body() ctx: UpdateUserDto,
  ) {
    this.logger.log(`Updating user ${ctx.userId} from ${ip} `);
    return this.userService.updateUser({
      ...ctx,
      profilePictureFilePath: profilePicture.path,
    });
  }
}
