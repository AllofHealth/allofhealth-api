import { Configuration, Value } from '@itgorillaz/configify';
import { IsNotEmpty } from 'class-validator';

@Configuration()
export class CalConfig {
  @IsNotEmpty()
  @Value('CALCOM_API_KEY')
  CALCOM_API_KEY: string;

  @IsNotEmpty()
  @Value('CALCOM_API_URL')
  CALCOM_API_URL: string;

  @IsNotEmpty()
  @Value('CALCOM_WEBHOOK_SECRET')
  CALCOM_WEBHOOK_SECRET: string;

  @IsNotEmpty()
  @Value('CALCOM_CLIENT_ID')
  CALCOM_CLIENT_ID: string;

  @IsNotEmpty()
  @Value('CALCOM_CLIENT_SECRET')
  CALCOM_CLIENT_SECRET: string;

  @IsNotEmpty()
  @Value('CALCOM_REDIRECT_URI')
  CALCOM_REDIRECT_URI: string;

  @IsNotEmpty()
  @Value('CALCOM_EMBED_URL')
  CALCOM_EMBED_URL: string;
}
