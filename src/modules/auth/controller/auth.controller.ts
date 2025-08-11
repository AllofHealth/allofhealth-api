import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Ip,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiFoundResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { SuccessResponseDto } from '@/shared/dtos/shared.dto';
import {
  AuthErrorMessage as AEM,
  AuthSuccessMessage as ASM,
} from '../data/auth.data';
import { SignInDto, SignUpDto } from '../dto/auth.dto';
import { AuthError } from '../error/auth.error';
import { AuthService } from '../service/auth.service';

@ApiTags('Auth Operations')
@Controller('auth')
export class AuthController {
  private readonly logger = new MyLoggerService(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Post('signUp')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'governmentId', maxCount: 1 },
        { name: 'scannedLicense', maxCount: 1 },
      ],
      {
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
      },
    ),
  )
  @ApiOperation({
    summary: 'Sign up a new user',
    description:
      'Register a new user with identity verification documents. Government ID is required for all users, medical license is required for doctors only.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'User registration data with identity documents',
    schema: {
      type: 'object',
      properties: {
        fullName: {
          type: 'string',
          description: "User's full name",
          example: 'John Doe',
        },
        emailAddress: {
          type: 'string',
          format: 'email',
          description: "User's email address",
          example: 'john.doe@example.com',
        },
        password: {
          type: 'string',
          format: 'password',
          description: "User's password (minimum 8 characters)",
          example: 'SecurePassword123!',
        },
        role: {
          type: 'string',
          enum: ['PATIENT', 'DOCTOR'],
          description: 'User role - determines required documents',
          example: 'PATIENT',
        },
        phoneNumber: {
          type: 'string',
          description: "User's phone number",
          example: '+1234567890',
        },
        dateOfBirth: {
          type: 'string',
          format: 'date',
          description: "User's date of birth (YYYY-MM-DD)",
          example: '1990-01-15',
        },
        gender: {
          type: 'string',
          description: "User's gender",
          example: 'Male',
        },
        specialization: {
          type: 'string',
          description: "Doctor's specialization (Required for DOCTOR role)",
          example: 'Cardiologist',
        },
        bio: {
          type: 'string',
          description: "Doctor's bio",
          example:
            'Cardiologist with 24 years of experience available for physical and virtual consultation',
        },
        medicalLicenseNumber: {
          type: 'string',
          description:
            "Doctor's medical license number (Required for DOCTOR role)",
          example: '123456789',
        },
        yearsOfExperience: {
          type: 'number',
          description:
            "Doctor's years of experience (Optional for DOCTOR role)",
          example: 5,
        },
        certifications: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: "Doctor's certifications (Optional for DOCTOR role)",
          example: ['Certification 1', 'Certification 2'],
        },
        hospitalAssociation: {
          type: 'string',
          description:
            "Doctor's hospital association (Optional for DOCTOR role)",
          example: 'General Hospital',
        },
        locationOfHospital: {
          type: 'string',
          description:
            "Location of doctor's hospital (Optional for DOCTOR role)",
          example: 'New York, NY',
        },
        languagesSpoken: {
          type: 'array',
          items: {
            type: 'string',
          },
          description:
            'Languages spoken by the doctor (Optional for DOCTOR role)',
          example: ['English', 'Spanish'],
        },
        licenseExpirationDate: {
          type: 'string',
          format: 'date',
          description:
            "Doctor's license expiration date (Optional for DOCTOR role)",
          example: '2025-12-13',
        },
        governmentId: {
          type: 'string',
          format: 'binary',
          description:
            'Government-issued ID document (Required for all users) - Supported formats: JPG, PNG, PDF. Max size: 5MB',
        },
        scannedLicense: {
          type: 'string',
          format: 'binary',
          description:
            'Medical license document (Required for DOCTOR role only) - Supported formats: JPG, PNG, PDF. Max size: 5MB',
        },
      },
      required: [
        'fullName',
        'emailAddress',
        'password',
        'role',
        'phoneNumber',
        'dateOfBirth',
        'gender',
        'governmentId',
      ],
    },
  })
  @ApiSecurity('Authorization')
  @ApiOkResponse({
    description: ASM.REGISTRATION_SUCCESS,
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: ASM.REGISTRATION_SUCCESS,
      data: {
        userId: 'uuid-string',
        message: 'Registration successful. Please verify your email.',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: AEM.REGISTRATION_FAILED,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: AEM.REGISTRATION_FAILED,
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation errors or missing required documents',
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: 'Government ID is required for all users',
    },
  })
  @ApiFoundResponse({
    example: {
      description: AEM.USER_ALREADY_EXISTS,
      status: HttpStatus.FOUND,
      message: AEM.USER_ALREADY_EXISTS,
    },
  })
  async signUp(
    @Ip() ip: string,
    @Body() ctx: SignUpDto,
    @UploadedFiles()
    files: {
      governmentId?: Express.Multer.File[];
      scannedLicense?: Express.Multer.File[];
    },
  ) {
    if (!files.governmentId || files.governmentId.length === 0) {
      throw new BadRequestException(
        'Government ID is required. Please ensure the form field name is "governmentId"',
      );
    }

    if (
      ctx.role === 'DOCTOR' &&
      (!files.scannedLicense || files.scannedLicense.length === 0)
    ) {
      throw new BadRequestException(
        'Medical license is required for doctor registration. Please ensure the form field name is "scannedLicense"',
      );
    }

    const governmentIdFile = files.governmentId[0];
    const scannedLicenseFile = files.scannedLicense?.[0];

    this.logger.log(`Sign up request from ${ip} for role: ${ctx.role}`);

    return await this.authService.handleRegister({
      ...ctx,
      governmentIdfilePath: governmentIdFile.path,
      scannedLicensefilePath: scannedLicenseFile?.path,
    });
  }

  @Post('signIn')
  @ApiOperation({ summary: 'Sign in an existing user' })
  @ApiNotFoundResponse({
    description: AEM.USER_NOT_FOUND,
    example: {
      status: HttpStatus.NOT_FOUND,
      message: AEM.USER_NOT_FOUND,
    },
  })
  @ApiUnauthorizedResponse({
    type: AuthError,
    example: {
      status: HttpStatus.UNAUTHORIZED,
      message: AEM.INVALID_CREDENTIALS,
    },
  })
  @ApiOkResponse({
    description: ASM.LOGGED_IN,
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: ASM.LOGGED_IN,
      data: {
        userId: '',
        fullName: '',
        email: '',
        role: 'PATIENT',
        profilePicture: '',
        isFirstTime: true,
        refreshToken: '',
        accessToken: '',
      },
    },
  })
  async signIn(@Ip() ip: string, @Body() ctx: SignInDto) {
    this.logger.log(`Sign in request from ${ip}`);
    return await this.authService.handleLogin(ctx);
  }
}
