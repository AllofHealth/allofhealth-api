import { Module } from '@nestjs/common';
import { DailyCoService } from './service/daily.co.service';
import { DailyCoProvider } from './provider/daily.co.provider';

@Module({
  providers: [DailyCoProvider, DailyCoService],
})
export class DailyCoModule {}
