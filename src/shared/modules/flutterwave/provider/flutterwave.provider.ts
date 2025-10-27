import { FlutterwaveConfig } from '@/shared/config/flutterwave/flutterwave.config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FlutterwaveProvider {
  constructor(private readonly flutterwaveConfig: FlutterwaveConfig) {}
}
