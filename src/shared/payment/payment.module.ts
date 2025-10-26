import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FlutterwaveService } from './service/flutterwave.service';
import { flutterwaveConfig } from '../config/payment/flutterwave.config';

@Module({
    imports: [ConfigModule.forFeature(flutterwaveConfig)],
    providers: [FlutterwaveService],
    exports: [FlutterwaveService],
})
export class PaymentModule { }