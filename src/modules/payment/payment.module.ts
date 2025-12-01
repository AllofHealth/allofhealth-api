import { Module } from '@nestjs/common';
import { PaymentService } from './service/payment.service';
import { PaymentController } from './controller/payment.controller';
import { FlutterwaveModule } from '@/shared/modules/flutterwave/flutterwave.module';

@Module({
  imports: [FlutterwaveModule],
  providers: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
