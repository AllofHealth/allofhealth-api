import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { SuccessResponseDto } from '@/shared/dtos/shared.dto';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Ip,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  RECORDS_ERROR_MESSAGES as REM,
  RECORDS_SUCCESS_MESSAGES as RSM,
} from '../data/records.data';
import {
  CreateRecordDto,
  FetchRecordByChainIdDto,
  FetchRecordsDto,
} from '../dto/records.dto';
import { RecordsService } from '../service/records.service';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { OwnerGuard } from '@/modules/user/guard/user.guard';
import { SuspensionGuard } from '@/modules/auth/guards/suspension.guard';

@ApiTags('Medical Records Operations')
@Controller('records')
export class RecordsController {
  private readonly logger = new MyLoggerService(RecordsController.name);
  constructor(private readonly recordsService: RecordsService) {}

  @Post('createMedicalRecord')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'attachment1', maxCount: 1 },
        { name: 'attachment2', maxCount: 1 },
        { name: 'attachment3', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads/records',
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
    summary: 'Create a new medical record',
    description:
      'Create a new medical record with optional file attachments. Maximum of 3 attachments allowed per record. The practitioner must have valid approval with write or full permissions to create records for the specified patient.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Medical record data with optional attachments',
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'The title of the medical record',
          example: 'Annual Physical Examination',
        },
        practitionerId: {
          type: 'string',
          format: 'uuid',
          description:
            'The unique identifier of the practitioner creating the record',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
        approvalId: {
          type: 'string',
          format: 'uuid',
          description:
            'The unique identifier of the approval given to create this record',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
        patientId: {
          type: 'string',
          format: 'uuid',
          description: 'The unique identifier of the patient',
          example: '550e8400-e29b-41d4-a716-446655440001',
        },
        clinicalNotes: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'Clinical notes from the examination or consultation',
          example: [
            'Patient appears healthy',
            'Vital signs are normal',
            'No significant findings',
          ],
        },
        diagnosis: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'Medical diagnoses made by the practitioner',
          example: ['Hypertension', 'Type 2 Diabetes'],
        },
        labResults: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'Laboratory test results (optional)',
          example: ['Blood glucose: 120 mg/dL', 'Cholesterol: 180 mg/dL'],
        },
        medicationsPrscribed: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'Medications prescribed to the patient (optional)',
          example: [
            'Metformin 500mg twice daily',
            'Lisinopril 10mg once daily',
          ],
        },
        attachment1: {
          type: 'string',
          format: 'binary',
          description:
            'First optional attachment (Supported formats: JPG, PNG, PDF. Max size: 10MB)',
        },
        attachment2: {
          type: 'string',
          format: 'binary',
          description:
            'Second optional attachment (Supported formats: JPG, PNG, PDF. Max size: 10MB)',
        },
        attachment3: {
          type: 'string',
          format: 'binary',
          description:
            'Third optional attachment (Supported formats: JPG, PNG, PDF. Max size: 10MB)',
        },
      },
      required: [
        'title',
        'practitionerId',
        'patientId',
        'clinicalNotes',
        'diagnosis',
      ],
    },
  })
  @ApiSecurity('Authorization')
  @ApiOkResponse({
    description: RSM.SUCCESS_CREATING_RECORD,
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: RSM.SUCCESS_CREATING_RECORD,
      data: {
        recordId: 'uuid-string',
        chainId: 1,
        ipfsCid: 'QmXXXXXX...',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: REM.ERROR_CREATING_RECORD,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: REM.ERROR_CREATING_RECORD,
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation errors or invalid file formats',
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: 'Invalid file format. Only JPG, PNG, and PDF files are allowed.',
    },
  })
  @ApiForbiddenResponse({
    description: 'Practitioner authorization failed',
    example: {
      status: HttpStatus.FORBIDDEN,
      message:
        "Practitioner is not approved to access this patient's records or lacks sufficient permissions.",
    },
  })
  async createRecord(
    @Ip() ip: string,
    @Body() ctx: CreateRecordDto,
    @UploadedFiles()
    files: {
      attachment1?: Express.Multer.File[];
      attachment2?: Express.Multer.File[];
      attachment3?: Express.Multer.File[];
    },
  ) {
    // Validate file types if any files are uploaded
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
    ];

    const validateFile = (file: Express.Multer.File) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `Invalid file format for ${file.fieldname}. Only JPG, PNG, and PDF files are allowed.`,
        );
      }
    };

    if (files.attachment1?.[0]) validateFile(files.attachment1[0]);
    if (files.attachment2?.[0]) validateFile(files.attachment2[0]);
    if (files.attachment3?.[0]) validateFile(files.attachment3[0]);

    this.logger.log(
      `Create record request from ${ip} for patient: ${ctx.patientId}`,
    );

    return await this.recordsService.createRecord({
      ...ctx,
      attachment1: files.attachment1?.[0],
      attachment2: files.attachment2?.[0],
      attachment3: files.attachment3?.[0],
    });
  }

  @Get('fetchRecords')
  @UseGuards(AuthGuard, OwnerGuard)
  @ApiOperation({
    summary: 'Fetch patient medical records',
    description:
      'Retrieve paginated medical records for a specific patient. Only the patient themselves or approved practitioners can access these records.',
  })
  @ApiQuery({
    name: 'userId',
    type: 'string',
    required: true,
    description: 'The unique identifier of the patient',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiQuery({
    name: 'page',
    type: 'number',
    required: false,
    description: 'Page number for pagination (default: 1)',
    example: 1,
    minimum: 1,
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
    description: 'Number of records per page (default: 12)',
    example: 12,
    minimum: 1,
  })
  @ApiSecurity('Authorization')
  @ApiOkResponse({
    description: RSM.SUCCESS_FETCHING_RECORDS,
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: RSM.SUCCESS_FETCHING_RECORDS,
      data: [
        {
          id: 'uuid-string',
          title: 'Annual Physical Examination',
          recordType: 'general',
          practitionerName: 'Dr. John Smith',
          status: 'active',
          createdAt: '2024-01-01',
        },
        {
          id: 'uuid-string-2',
          title: 'Follow-up Consultation',
          recordType: 'consultation',
          practitionerName: 'Dr. Jane Doe',
          status: 'active',
          createdAt: '2024-01-15',
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
    description: REM.ERROR_FETCHING_RECORDS,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: REM.ERROR_FETCHING_RECORDS,
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation errors',
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: 'Invalid pagination parameters or user ID format.',
    },
  })
  @ApiForbiddenResponse({
    description: 'Access denied',
    example: {
      status: HttpStatus.FORBIDDEN,
      message: 'You are not authorized to access these records.',
    },
  })
  async fetchRecords(@Ip() ip: string, @Query() ctx: FetchRecordsDto) {
    this.logger.log(
      `Fetch records request from ${ip} for patient: ${ctx.userId}`,
    );

    return await this.recordsService.fetchRecords(ctx);
  }

  @Get('fetchRecordByChainId')
  @UseGuards(AuthGuard, SuspensionGuard)
  @ApiOperation({
    summary: 'Fetch a specific medical record by chain ID',
    description:
      'Retrieve a specific medical record using its chain ID. The record will be fetched from IPFS and decrypted. Only the patient themselves or approved practitioners with appropriate permissions can access the record.',
  })
  @ApiQuery({
    name: 'patientId',
    type: 'string',
    required: true,
    description: 'The unique identifier of the patient',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiQuery({
    name: 'practitionerId',
    type: 'string',
    required: false,
    description:
      'The unique identifier of the practitioner (optional - for practitioner access)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'recordChainId',
    type: 'number',
    required: true,
    description: 'The chain ID of the medical record',
    example: 1,
    minimum: 1,
  })
  @ApiSecurity('Authorization')
  @ApiOkResponse({
    description: RSM.RECORD_FETCHED_SUCCESSFULLY,
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: RSM.RECORD_FETCHED_SUCCESSFULLY,
      data: {
        title: 'Annual Physical Examination',
        clinicalNotes: [
          'Patient appears healthy',
          'Vital signs are normal',
          'No significant findings',
        ],
        diagnosis: ['Hypertension', 'Type 2 Diabetes'],
        labResults: ['Blood glucose: 120 mg/dL', 'Cholesterol: 180 mg/dL'],
        medicationsPrscribed: [
          'Metformin 500mg twice daily',
          'Lisinopril 10mg once daily',
        ],
        attachments: ['attachment1.pdf', 'attachment2.jpg'],
        recordType: ['Diagnosis', 'Lab Results'],
        uploadedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: REM.ERROR_FETCHING_RECORDS,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: REM.ERROR_FETCHING_RECORDS,
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation errors',
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: 'Invalid record chain ID or patient ID format.',
    },
  })
  @ApiForbiddenResponse({
    description: 'Access denied',
    example: {
      status: HttpStatus.FORBIDDEN,
      message: 'You are not authorized to access this record.',
    },
  })
  async fetchRecordByChainId(
    @Ip() ip: string,
    @Query() ctx: FetchRecordByChainIdDto,
  ) {
    this.logger.log(
      `Fetch record by chain ID request from ${ip} for patient: ${ctx.patientId}, record chain ID: ${ctx.recordChainId}`,
    );

    return await this.recordsService.fetchRecordByChainId(ctx);
  }
}
