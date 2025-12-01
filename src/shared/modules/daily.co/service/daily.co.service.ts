import { Injectable } from '@nestjs/common';
import { DailyCoProvider } from '../provider/daily.co.provider';

@Injectable()
export class DailyCoService {
  constructor(private readonly dailyCoProvider: DailyCoProvider) {}
}
