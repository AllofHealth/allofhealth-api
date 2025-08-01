import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { OwnerGuard } from '@/modules/user/guard/user.guard';
import { ErrorResponseDto, SuccessResponseDto } from '@/shared/dtos/shared.dto';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Ip,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  APPROVAL_ERROR_MESSAGE as AEM,
  APPROVAL_SUCCESS_MESSAGE as ASM,
} from '../data/approval.data';
import {
  AcceptApprovalDto,
  CreateApprovalDto,
  FetchDoctorApprovalsDto,
  FetchPatientApprovalsDto,
  RejectApprovalDto,
} from '../dto/approval.dto';
import { ApprovalService } from '../service/approval.service';

@ApiTags('Approval Operations')
@Controller('approval')
export class ApprovalController {
  private readonly logger = new MyLoggerService(ApprovalController.name);
  constructor(private readonly approvalService: ApprovalService) {}

  @Post('createApproval')
  @UseGuards(AuthGuard, OwnerGuard)
  @ApiOperation({
    summary: 'Create new approvals',
    description:
      "Creates approval requests for a practitioner to access patient records. Supports creating multiple approvals atomically - either all approvals are created or none are created. When shareHealthInfo is set to true, the patient's health information will be automatically shared with the practitioner upon approval creation. This requires the patient to have existing health information on file.",
  })
  @ApiBody({
    description: 'Approval creation data',
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'Patient User ID',
          example: '1234567890',
        },
        practitionerId: {
          type: 'string',
          description: 'Practitioner ID',
          example: '1234567890',
        },
        recordIds: {
          type: 'array',
          items: {
            type: 'number',
          },
          description:
            'Array of medical record contract IDs (required for full access)',
          example: [1, 2, 3],
        },
        duration: {
          type: 'number',
          description: 'Access Duration in milliseconds',
          example: 3600,
        },
        accessLevel: {
          type: 'string',
          enum: ['read', 'write', 'full'],
          description: 'Access Level',
          example: 'full',
        },
        shareHealthInfo: {
          type: 'boolean',
          description:
            'Whether to share health information with the practitioner',
          example: false,
          default: false,
        },
      },
      required: ['userId', 'practitionerId', 'accessLevel'],
    },
  })
  @ApiOkResponse({
    description: ASM.APPROVAL_CREATED,
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: ASM.APPROVAL_CREATED,
      data: {
        approvalIds: ['approval-id-123', 'approval-id-456', 'approval-id-789'],
        totalCreated: 3,
      },
    },
  })
  @ApiBadRequestResponse({
    description: AEM.NOT_A_VALID_PRACTITIONER,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: AEM.NOT_A_VALID_PRACTITIONER,
    },
  })
  @ApiBadRequestResponse({
    description: AEM.PRACTITIONER_NOT_VERIFIED,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: AEM.PRACTITIONER_NOT_VERIFIED,
    },
  })
  @ApiBadRequestResponse({
    description: AEM.RECORD_ID_IS_REQUIRED,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: AEM.RECORD_ID_IS_REQUIRED,
    },
  })
  @ApiBadRequestResponse({
    description: AEM.APPROVAL_ALREADY_EXISTS,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: AEM.APPROVAL_ALREADY_EXISTS + ' for record ID: 123',
    },
  })
  @ApiUnauthorizedResponse({
    description: AEM.PATIENT_ONLY,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.UNAUTHORIZED,
      message: AEM.PATIENT_ONLY,
    },
  })
  @ApiNotFoundResponse({
    description: AEM.HEALTH_INFO_NOT_FOUND,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.NOT_FOUND,
      message: AEM.HEALTH_INFO_NOT_FOUND,
    },
  })
  @ApiInternalServerErrorResponse({
    description: AEM.ERROR_CREATING_APPROVAL,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: AEM.ERROR_CREATING_APPROVAL,
    },
  })
  async createApproval(@Ip() ip: string, @Body() ctx: CreateApprovalDto) {
    this.logger.log(
      `Creating ${ctx.recordIds?.length || 1} approval(s) for user ${ctx.userId} from ${ip}`,
    );
    return await this.approvalService.createApproval(ctx);
  }

  @Get('fetchDoctorApprovals')
  @UseGuards(AuthGuard, OwnerGuard)
  @ApiOperation({ summary: 'Fetch approvals for a doctor' })
  @ApiOkResponse({
    description: ASM.APPROVAL_FETCHED,
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: ASM.APPROVAL_FETCHED,
      data: [
        {
          id: 'approval-id-123',
          userId: 'patient-id-456',
          practitionerAddress: '0x123...abc',
          recordId: 1,
          healthInfoId: '123455',
          duration: 3600,
          accessLevel: 'read',
          isRequestAccepted: false,
          patientFullName: 'John Doe',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: AEM.NOT_A_VALID_PRACTITIONER,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: AEM.NOT_A_VALID_PRACTITIONER,
    },
  })
  @ApiInternalServerErrorResponse({
    description: AEM.ERROR_FETCHING_DOCTOR_APPROVAL,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: AEM.ERROR_FETCHING_DOCTOR_APPROVAL,
    },
  })
  async fetchDoctorApprovals(
    @Ip() ip: string,
    @Query() query: FetchDoctorApprovalsDto,
  ) {
    this.logger.log(`Fetching approvals for doctor ${query.userId} from ${ip}`);
    return await this.approvalService.fetchDoctorApprovals(query.userId);
  }

  @Get('fetchPatientApprovals')
  @UseGuards(AuthGuard, OwnerGuard)
  @ApiOperation({
    summary: 'Fetch approvals for a patient',
    description:
      'Retrieve all approval requests associated with a specific patient, with pagination support.',
  })
  @ApiOkResponse({
    description: ASM.PATIENT_APPROVALS_FETCHED,
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: ASM.PATIENT_APPROVALS_FETCHED,
      data: {
        approvals: [
          {
            id: 'approval-id-123',
            userId: 'patient-id-456',
            practitionerAddress: '0x123...abc',
            recordId: 1,
            healthInfoId: '123455',
            duration: 3600,
            accessLevel: 'read',
            isRequestAccepted: false,
            practitionerFullName: 'Dr. Jane Smith',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
        ],
        pagination: {
          page: 1,
          limit: 12,
          total: 25,
          totalPages: 3,
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: AEM.NOT_A_VALID_PRACTITIONER,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: AEM.NOT_A_VALID_PRACTITIONER,
    },
  })
  @ApiUnauthorizedResponse({
    description: AEM.PATIENT_ONLY,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.UNAUTHORIZED,
      message: AEM.PATIENT_ONLY,
    },
  })
  @ApiInternalServerErrorResponse({
    description: AEM.ERROR_FETCHING_PATIENT_APPROVALS,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: AEM.ERROR_FETCHING_PATIENT_APPROVALS,
    },
  })
  async fetchPatientApprovals(
    @Ip() ip: string,
    @Query() query: FetchPatientApprovalsDto,
  ) {
    this.logger.log(
      `Fetching approvals for patient ${query.userId} from ${ip} - Page: ${query.page || 1}, Limit: ${query.limit || 12}`,
    );
    return await this.approvalService.fetchPatientApprovals(query);
  }

  @Post('acceptApproval')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Accept an approval request' })
  @ApiOkResponse({
    description: ASM.APPROVAL_ACCEPTED,
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: ASM.APPROVAL_ACCEPTED,
    },
  })
  @ApiBadRequestResponse({
    description: AEM.NOT_A_VALID_PRACTITIONER,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: AEM.NOT_A_VALID_PRACTITIONER,
    },
  })
  @ApiBadRequestResponse({
    description: AEM.APPROVAL_NOT_FOUND,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: AEM.APPROVAL_NOT_FOUND,
    },
  })
  @ApiInternalServerErrorResponse({
    description: AEM.ERROR_ACCEPTING_APPROVAL,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: AEM.ERROR_ACCEPTING_APPROVAL,
    },
  })
  async acceptApproval(@Ip() ip: string, @Body() ctx: AcceptApprovalDto) {
    this.logger.log(
      `Doctor ${ctx.userId} accepting approval ${ctx.approvalId} from ${ip}`,
    );
    return await this.approvalService.acceptApproval({
      doctorId: ctx.userId,
      approvalId: ctx.approvalId,
    });
  }

  @Post('rejectApproval')
  @UseGuards(AuthGuard, OwnerGuard)
  @ApiOperation({ summary: 'Reject an approval request' })
  @ApiOkResponse({
    description: ASM.APPROVAL_REJECTED,
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: ASM.APPROVAL_REJECTED,
    },
  })
  @ApiBadRequestResponse({
    description: AEM.NOT_A_VALID_PRACTITIONER,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: AEM.NOT_A_VALID_PRACTITIONER,
    },
  })
  @ApiBadRequestResponse({
    description: AEM.APPROVAL_NOT_FOUND,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: AEM.APPROVAL_NOT_FOUND,
    },
  })
  @ApiInternalServerErrorResponse({
    description: AEM.ERROR_REJECTING_APPROVAL,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: AEM.ERROR_REJECTING_APPROVAL,
    },
  })
  async rejectApproval(@Ip() ip: string, @Body() ctx: RejectApprovalDto) {
    this.logger.log(
      `Doctor ${ctx.userId} rejecting approval ${ctx.approvalId} from ${ip}`,
    );
    return await this.approvalService.rejectApproval({
      doctorId: ctx.userId,
      approvalId: ctx.approvalId,
    });
  }

  @Get('findApproval')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Find an approval by ID',
    description:
      'Retrieve a specific approval record using its unique identifier',
  })
  @ApiQuery({
    name: 'approvalId',
    description: 'The unique identifier of the approval to find',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  @ApiOkResponse({
    description: 'Approval found successfully',
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: 'Approval found',
      data: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        userId: 'patient-id-456',
        practitionerAddress: '0x123...abc',
        recordId: 1,
        duration: 3600,
        accessLevel: 'read',
        isRequestAccepted: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    },
  })
  @ApiNotFoundResponse({
    description: AEM.APPROVAL_NOT_FOUND,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.NOT_FOUND,
      message: AEM.APPROVAL_NOT_FOUND,
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error finding approval',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error finding approval',
    },
  })
  async findApprovalById(
    @Ip() ip: string,
    @Query('approvalId') approvalId: string,
  ) {
    this.logger.log(`Finding approval ${approvalId} from ${ip}`);
    return await this.approvalService.findApprovalById(approvalId);
  }

  @Get('cleanup/manual')
  @ApiOperation({ summary: 'Manually trigger cleanup of expired approvals' })
  @ApiOkResponse({
    description: 'Manual cleanup completed',
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: 'Manual cleanup completed',
      data: {
        deletedCount: 5,
        expiredApprovalIds: ['id1', 'id2', 'id3', 'id4', 'id5'],
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error during manual cleanup',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error during manual cleanup',
    },
  })
  async manualCleanup(@Ip() ip: string) {
    this.logger.log(`Manual cleanup triggered from ${ip}`);
    try {
      const result = await this.approvalService.manualCleanup();
      return {
        status: HttpStatus.OK,
        message: 'Manual cleanup completed',
        data: result,
      };
    } catch (error) {
      this.logger.error('Error during manual cleanup:', error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error during manual cleanup',
        error: error.message,
      };
    }
  }
}
