import { FlutterwaveService } from '@/shared/modules/flutterwave/service/flutterwave.service';
import { Injectable } from '@nestjs/common';
import { IVerifyPayment } from '../interface/payment.interface';

/**
 * @todo: map flutter payment service here
 * @dev: Incase we have more than one payment provider, it will be unified here
 */

@Injectable()
export class PaymentService {
  constructor(private readonly flutterwaveService: FlutterwaveService) {}

  async verifyPayment(ctx: IVerifyPayment) {
    const { txId, provider = 'flutterwave' } = ctx;
    try {
      return await this.flutterwaveService.verifyPayment(txId);
    } catch (e) {
      throw e;
    }
  }
}
