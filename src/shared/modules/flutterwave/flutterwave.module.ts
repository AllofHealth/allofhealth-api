import { Module } from '@nestjs/common';
import { FlutterwaveService } from './service/flutterwave.service';
import { FlutterwaveProvider } from './provider/flutterwave.provider';

@Module({
  providers: [FlutterwaveService, FlutterwaveProvider],
  exports: [FlutterwaveService],
})
export class FlutterwaveModule {}
