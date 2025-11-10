import { Configuration, Value } from '@itgorillaz/configify';
import { IsNotEmpty } from 'class-validator';

@Configuration()
export class DoxyConfig {
  @IsNotEmpty()
  @Value('DOXY_BASE_URL')
  DOXY_BASE_URL: string;

  @IsNotEmpty()
  @Value('DOXY_CLINIC_SUBDOMAIN')
  DOXY_CLINIC_SUBDOMAIN: string;

  @IsNotEmpty()
  @Value('DOXY_DEFAULT_PROVIDER_ROOM')
  DOXY_DEFAULT_PROVIDER_ROOM: string;

  @IsNotEmpty()
  @Value('DOXY_WEBHOOK_SECRET')
  DOXY_WEBHOOK_SECRET: string;

  @IsNotEmpty()
  @Value('DOXY_API_KEY')
  DOXY_API_KEY: string;
}
