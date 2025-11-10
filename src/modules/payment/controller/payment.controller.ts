import { Controller, Get, HttpStatus, Ip, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PaymentService } from '../service/payment.service';
import { VerifyPaymentDto } from '../dto/payment.dto';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { ErrorResponseDto, SuccessResponseDto } from '@/shared/dtos/shared.dto';

@ApiTags('Payment Operations')
@Controller('payment')
export class PaymentController {
  private readonly logger = new MyLoggerService(PaymentController.name);
  constructor(private readonly paymentService: PaymentService) {}

  @Get('verifyPayment/:txId')
  @ApiOperation({
    summary: 'Verify payment status',
    description:
      'Verifies the status of a payment using its transaction ID. This endpoint can be used to confirm if a payment was successful.',
  })
  @ApiParam({
    name: 'txId',
    description: 'The transaction ID of the payment to verify',
    type: String,
    example: 'flw_tx_1234567890',
  })
  @ApiOkResponse({
    description: 'Payment verified successfully',
    type: SuccessResponseDto,
    example: {
      status: HttpStatus.OK,
      message: 'Payment verified successfully',
      data: {
        transactionId: 'flw_tx_1234567890',
        status: 'successful',
        amount: 100.0,
        currency: 'NGN',
        customerEmail: 'test@example.com',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid transaction ID format',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: 'Invalid transaction ID format',
    },
  })
  @ApiNotFoundResponse({
    description: 'Payment not found for the given transaction ID',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.NOT_FOUND,
      message: 'Payment not found',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occurred',
    type: ErrorResponseDto,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error verifying payment',
    },
  })
  async verifyPayment(@Ip() ip: string, @Param('txId') ctx: VerifyPaymentDto) {
    this.logger.log(`verifyPayment called with ip: ${ip}`);
    return await this.paymentService.verifyPayment(ctx);
  }
}
