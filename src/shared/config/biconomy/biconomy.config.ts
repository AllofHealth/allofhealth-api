import { Configuration, Value } from '@itgorillaz/configify';
import { IsNotEmpty } from 'class-validator';

@Configuration()
export class BiconomyConfig {
  // Testnet config
  @IsNotEmpty()
  @Value('LISK_TESTNET_BUNDLER_API_KEY')
  LISK_TESTNET_BUNDLER_API_KEY: string;

  @IsNotEmpty()
  @Value('LISK_TESTNET_BUNDLER_URL')
  LISK_TESTNET_BUNDLER_URL: string;

  @IsNotEmpty()
  @Value('LISK_TESTNET_BUNDLER_ID')
  LISK_TESTNET_BUNDLER_ID: string;

  // Mainnet config
  @IsNotEmpty()
  @Value('LISK_MAINNET_BUNDLER_API_KEY')
  LISK_MAINNET_BUNDLER_API_KEY: string;

  @IsNotEmpty()
  @Value('LISK_MAINNET_BUNDLER_URL')
  LISK_MAINNET_BUNDLER_URL: string;

  @IsNotEmpty()
  @Value('LISK_MAINNET_BUNDLER_ID')
  LISK_MAINNET_BUNDLER_ID: string;

  @IsNotEmpty()
  @Value('LISK_MAINNET_PAYMASTER_API_KEY')
  LISK_MAINNET_PAYMASTER_API_KEY: string;

  @IsNotEmpty()
  @Value('LISK_TESTNET_PAYMASTER_API_KEY')
  LISK_TESTNET_PAYMASTER_API_KEY: string;
}
