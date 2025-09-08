import { Configuration, Value } from '@itgorillaz/configify';
import { IsNotEmpty } from 'class-validator';

@Configuration()
export class BrevoConfig {
  @IsNotEmpty()
  @Value('BREVO_API_KEY')
  BREVO_API_KEY: string;
}
