import { Configuration, Value } from '@itgorillaz/configify';
import { IsNotEmpty } from 'class-validator';

@Configuration()
export class FlutterwaveConfig {
  @IsNotEmpty()
  @Value('FLUTTERWAVE_CLIENT_ID')
  FLUTTERWAVE_CLIENT_ID: string;

  @IsNotEmpty()
  @Value('FLUTTERWAVE_CLIENT_SECRET')
  FLUTTERWAVE_CLIENT_SECRET: string;

  @IsNotEmpty()
  @Value('FLUTTERWAVE_ENCRYPTION_KEY')
  FLUTTERWAVE_ENCRYPTION_KEY: string;

  @IsNotEmpty()
  @Value('FLUTTERWAVE_WEBHOOK_URL')
  FLUTTERWAVE_WEBHOOK_URL: string;

  @IsNotEmpty()
  @Value('FLUTTERWAVE_WEBHOOK_SECRET')
  FLUTTERWAVE_WEBHOOK_SECRET: string;
}
