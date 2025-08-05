import { Configuration, Value } from '@itgorillaz/configify';
import { IsNotEmpty } from 'class-validator';

@Configuration()
export class ResendConfig {
  @IsNotEmpty()
  @Value('RESEND_API_KEY')
  RESEND_API_KEY: string;
}
