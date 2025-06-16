import { Configuration, Value } from '@itgorillaz/configify';
import { IsNotEmpty } from 'class-validator';

@Configuration()
export class ImageKitConfig {
  @IsNotEmpty()
  @Value('IMAGE_KIT_PUBLIC_KEY')
  IMAGE_KIT_PUBLIC_KEY: string;

  @IsNotEmpty()
  @Value('IMAGE_KIT_PRIVATE_KEY')
  IMAGE_KIT_PRIVATE_KEY: string;

  @IsNotEmpty()
  @Value('IMAGE_KIT_URL_ENDPOINT')
  IMAGE_KIT_URL_ENDPOINT: string;
}
