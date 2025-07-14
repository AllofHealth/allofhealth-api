import { Configuration, Value } from '@itgorillaz/configify';
import { IsNotEmpty } from 'class-validator';

@Configuration()
export class recordConfig {
  @IsNotEmpty()
  @Value('RECORD_ENCRYPTION_KEY')
  RECORD_ENCRYPTION_KEY: string;
}
