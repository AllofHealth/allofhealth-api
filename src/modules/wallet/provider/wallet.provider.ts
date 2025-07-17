import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { ExternalAccountService } from '@/shared/modules/external-account/service/external-account.service';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class WalletProvider {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
    private readonly eoaService: ExternalAccountService,
    private readonly handler: ErrorHandler,
  ) {}
}
