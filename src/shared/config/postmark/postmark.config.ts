import { Configuration, Value } from '@itgorillaz/configify';
import { IsNotEmpty, IsString } from 'class-validator';

@Configuration()
export class PostmarkConfig {
  @IsNotEmpty()
  @IsString()
  @Value('POSTMARK_SERVER_TOKEN')
  SERVER_TOKEN: string;
}
