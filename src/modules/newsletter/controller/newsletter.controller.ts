import { Body, Controller, HttpStatus, Ip, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { NewsletterService } from '../service/newsletter.service';
import { SuccessResponseDto, ErrorResponseDto } from '@/shared/dtos/shared.dto';
import { SubscribeDto } from '../dto/newsletter.dto';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';

@ApiTags('Newsletter Operations')
@Controller('newsletter')
export class NewsletterController {
  private readonly logger = new MyLoggerService(NewsletterController.name);
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  @ApiOperation({
    summary: 'Subscribe to the newsletter',
    description: 'Adds a new contact to the newsletter subscription list.',
  })
  @ApiBody({
    description: 'Contact information for newsletter subscription',
    schema: {
      type: 'object',
      properties: {
        emailAddress: {
          type: 'string',
          format: 'email',
          description: 'Email address to subscribe',
          example: 'subscriber@example.com',
        },
      },
      required: ['emailAddress'],
    },
  })
  @ApiOkResponse({
    description: 'Successfully subscribed to the newsletter',
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: 'Successfully subscribed to the newsletter',
      data: {
        id: '2',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid email address or already subscribed',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: 'Invalid email address or already subscribed',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error subscribing to newsletter',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error subscribing to newsletter',
    },
  })
  async subscribe(@Ip() ip: string, @Body() ctx: SubscribeDto) {
    this.logger.log(`Subscribing ${ctx.emailAddress} from ${ip}`);
    return await this.newsletterService.subscribe(ctx);
  }
}
