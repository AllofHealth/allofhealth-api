import { IsNotEmpty } from 'class-validator';
import { Configuration, Value } from '@itgorillaz/configify';

@Configuration()
export class ContractConfig {
  @IsNotEmpty()
  @Value('ENCRYPTION_KEY')
  ENCRYPTION_KEY: string;

  @IsNotEmpty()
  @Value('CONTRACT_ADDRESS')
  CONTRACT_ADDRESS: string;

  @IsNotEmpty()
  @Value('SUPER_PRIVATE_KEY')
  SUPER_PRIVATE_KEY: string;
}
