import {
  Body,
  Controller,
  HttpStatus,
  Ip,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Put,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { SuccessResponseDto, ErrorResponseDto } from '@/shared/dtos/shared.dto';
import {
  HEALTH_INFO_ERROR_MESSAGES as HIEM,
  HEALTH_INFO_SUCCESS_MESSAGES as HISM,
} from '../data/health-info.data';
import {
  CreateHealthInfoDto,
  UpdateHealthInfoDto,
} from '../dto/health-info.dto';
import { HealthInfoService } from '../service/health-info.service';
import { OwnerGuard } from '@/modules/user/guard/user.guard';

@ApiTags('Health Information Operations')
@Controller('health-info')
export class HealthInfoController {
  private readonly logger = new MyLoggerService(HealthInfoController.name);

  constructor(private readonly healthInfoService: HealthInfoService) {}

  @Post('create')
  @UseInterceptors(
    FileInterceptor('attachment', {
      storage: diskStorage({
        destination: './uploads/health-info',
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
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Create health information',
    description:
      'Creates a new health information record with optional attachment',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Health information data with optional attachment',
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'The user identifier',
          example: '1234567890',
        },
        howAreYouFeeling: {
          type: 'string',
          description: 'How the user is feeling',
          example: 'I have been experiencing headaches and fatigue',
        },
        whenDidItStart: {
          type: 'string',
          description: 'When the symptoms started',
          example: '3 days ago',
        },
        painLevel: {
          type: 'string',
          enum: ['severe', 'moderate', 'mild'],
          description: 'Pain level experienced',
          example: 'moderate',
        },
        knownConditions: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'Known medical conditions (optional)',
          example: ['hypertension', 'diabetes'],
        },
        medicationsTaken: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'Medications currently taken (optional)',
          example: ['ibuprofen', 'lisinopril'],
        },
        attachment: {
          type: 'string',
          format: 'binary',
          description: 'Medical attachment file (optional)',
        },
      },
      required: ['userId', 'howAreYouFeeling', 'whenDidItStart', 'painLevel'],
    },
  })
  @ApiOkResponse({
    description: 'Health information created successfully',
    type: SuccessResponseDto,
    example: {
      status: 200,
      message: HISM.HEALTH_INFO_CREATED,
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: HIEM.ERROR_CREATING_HEALTH_INFO,
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid health info data',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: HIEM.HEALTH_INFO_INVALID_DATA,
    },
  })
  async createHealthInfo(
    @Ip() ip: string,
    @UploadedFile() attachment: Express.Multer.File,
    @Body() ctx: CreateHealthInfoDto,
  ) {
    this.logger.log(`Creating health info for user ${ctx.userId} from ${ip}`);
    return this.healthInfoService.createHealthInfo({
      ...ctx,
      attachmentFilePath: attachment?.path,
    });
  }

  @Put('update')
  @UseInterceptors(
    FileInterceptor('attachment', {
      storage: diskStorage({
        destination: './uploads/health-info',
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
  @ApiOperation({
    summary: 'Update health information',
    description:
      'Updates existing health information record with optional new attachment',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Health information update data with optional attachment',
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'The user identifier',
          example: '1234567890',
        },
        howAreYouFeeling: {
          type: 'string',
          description: 'How the user is feeling (optional)',
          example: 'I have been experiencing headaches and fatigue',
        },
        whenDidItStart: {
          type: 'string',
          description: 'When the symptoms started (optional)',
          example: '3 days ago',
        },
        painLevel: {
          type: 'string',
          enum: ['severe', 'moderate', 'mild'],
          description: 'Pain level experienced (optional)',
          example: 'moderate',
        },
        knownConditions: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'Known medical conditions (optional)',
          example: ['hypertension', 'diabetes'],
        },
        medicationsTaken: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'Medications currently taken (optional)',
          example: ['ibuprofen', 'lisinopril'],
        },
        attachment: {
          type: 'string',
          format: 'binary',
          description: 'Medical attachment file (optional)',
        },
      },
      required: ['userId'],
    },
  })
  @ApiOkResponse({
    description: 'Health information updated successfully',
    type: SuccessResponseDto,
    example: {
      status: 200,
      message: HISM.HEALTH_INFO_UPDATED,
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: HIEM.ERROR_UPDATING_HEALTH_INFO,
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid health info data',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: HIEM.HEALTH_INFO_INVALID_DATA,
    },
  })
  @ApiNotFoundResponse({
    description: 'Health info not found',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.NOT_FOUND,
      message: HIEM.HEALTH_INFO_NOT_FOUND,
    },
  })
  async updateHealthInfo(
    @Ip() ip: string,
    @UploadedFile() attachment: Express.Multer.File,
    @Body() ctx: UpdateHealthInfoDto,
  ) {
    this.logger.log(`Updating health info for user ${ctx.userId} from ${ip}`);
    return this.healthInfoService.updateHealthInfo({
      ...ctx,
      attachmentFilePath: attachment?.path,
    });
  }
}
