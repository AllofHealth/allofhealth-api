import { Module } from '@nestjs/common';
import { FlutterwaveService } from './service/flutterwave.service';
import { FlutterwaveProvider } from './provider/flutterwave.provider';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [FlutterwaveService, FlutterwaveProvider],
  exports: [FlutterwaveService],
})
export class FlutterwaveModule {}
