import { Injectable } from '@nestjs/common';
import { ExternalAccountProvider } from '../../external-account/provider/external-account.provider';

@Injectable()
export class AccountAbstractionProvider {
  constructor(private readonly eoaProvider: ExternalAccountProvider) {}
}
