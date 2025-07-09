import { Configuration, Value } from '@itgorillaz/configify';
import { IsNotEmpty } from 'class-validator';

@Configuration()
export class IpfsConfig {
  @IsNotEmpty()
  @Value('IPFS_API_KEY')
  IPFS_API_KEY: string;

  @IsNotEmpty()
  @Value('IPFS_API_SECRET')
  IPFS_API_SECRET: string;

  @IsNotEmpty()
  @Value('IPFS_PORT')
  IPFS_PORT: number;

  @IsNotEmpty()
  @Value('IPFS_PROTOCOL')
  IPFS_PROTOCOL: string;
}
