import { Controller, HttpStatus, Ip, Post, UseGuards } from '@nestjs/common';
import { ApprovalService } from '../service/approval.service';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { CreateApprovalDto } from '../dto/approval.dto';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { OwnerGuard } from '@/modules/user/guard/user.guard';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  APPROVAL_SUCCESS_MESSAGE as ASM,
  APPROVAL_ERROR_MESSAGE as AEM,
} from '../data/approval.data';
import { ErrorResponseDto, SuccessResponseDto } from '@/shared/dtos/shared.dto';

@ApiTags('Approval Operations')
@Controller('approval')
export class ApprovalController {
  private readonly logger = new MyLoggerService(ApprovalController.name);
  constructor(private readonly approvalService: ApprovalService) {}

  @Post('createApproval')
  @UseGuards(AuthGuard, OwnerGuard)
  @ApiOperation({ summary: 'Create a new approval' })
  @ApiOkResponse({
    description: ASM.APPROVAL_CREATED,
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: ASM.APPROVAL_CREATED,
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
    description: AEM.RECORD_ID_IS_REQUIRED,
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: AEM.RECORD_ID_IS_REQUIRED,
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
  async createApproval(@Ip() ip: string, ctx: CreateApprovalDto) {
    this.logger.log(`Creating approval for user ${ctx.userId} from ${ip}`);
    return await this.approvalService.createApproval(ctx);
  }
}
