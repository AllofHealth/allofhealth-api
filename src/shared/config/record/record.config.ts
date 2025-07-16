import { Configuration, Value } from '@itgorillaz/configify';
import { IsNotEmpty } from 'class-validator';

@Configuration()
export class RecordConfig {
  @IsNotEmpty()
  @Value('RECORD_ENCRYPTION_KEY')
  RECORD_ENCRYPTION_KEY: string;
}
