import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FlutterwaveProvider } from '../provider/flutterwave.provider';
import {
  InitializePayment,
  IProcessRefund,
  PaymentResponse,
} from '../interface/flutterwave.interface';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { FlutterwaveError } from '../error/flutterwave.error';

@Injectable()
export class FlutterwaveService {
  private readonly logger = new MyLoggerService(FlutterwaveService.name);

  constructor(private readonly flutterwaveProvider: FlutterwaveProvider) {}

  async initializePayment(ctx: InitializePayment) {
    try {
      this.logger.log(`Initializing Flutterwave payment for ${ctx.email}`);

      const payload = {
        tx_ref: ctx.txRef,
        amount: ctx.amount,
        currency: ctx.currency,
        redirect_url: ctx.redirectUrl,
        customer: {
          email: ctx.email,
          name: ctx.name,
          phonenumber: ctx.phoneNumber || '',
        },
        customizations: {
          title: 'AllOf Health Consultation',
          description: `Payment for booking ${ctx.txRef}`,
          logo: 'https://your-logo-url.com/logo.png',
        },
        meta: ctx.metadata || {},
      };
      const url = `${this.flutterwaveProvider.provideBaseUrl()}/payments`;

      const response = await this.flutterwaveProvider.handleFlutterRequest({
        method: 'POST',
        url,
        data: payload,
        src: 'Initialize Payment',
      });
      return response.data;
    } catch (error) {
      this.logger.error('Failed to initialize Flutterwave payment', error);
      throw error;
    }
  }

  async verifyPayment(transactionId: string) {
    try {
      this.logger.log(`Verifying Flutterwave transaction: ${transactionId}`);
      const url = `${this.flutterwaveProvider.provideBaseUrl()}/transactions/${transactionId}/verify`;

      const response = await this.flutterwaveProvider.handleFlutterRequest({
        method: 'GET',
        url,
        src: 'Verify Payment',
      });

      return response.data;
    } catch (error) {
      this.logger.error('Failed to verify payment', error);
      throw new InternalServerErrorException(
        new FlutterwaveError('An error occurred while verifying the payment', {
          cause: error,
        }),
      );
    }
  }

  async processRefund(ctx: IProcessRefund) {
    const { transactionId, amount } = ctx;
    try {
      this.logger.log(`Processing refund for transaction: ${transactionId}`);

      const payload = {
        id: transactionId,
        ...(amount && { amount }),
      };

      const url = `${this.flutterwaveProvider.provideBaseUrl()}/transactions/${transactionId}/refund`;

      const response = await this.flutterwaveProvider.handleFlutterRequest({
        method: 'POST',
        url,
        data: payload,
        src: 'Process Refund',
      });

      return response.data;
    } catch (error) {
      this.logger.error('Failed to process refund', error);
      throw new InternalServerErrorException(
        new FlutterwaveError('An error occurred while processing the refund', {
          cause: error,
        }),
      );
    }
  }

  getPaymentConfig() {
    return this.flutterwaveProvider.getPaymentConfig();
  }
}
