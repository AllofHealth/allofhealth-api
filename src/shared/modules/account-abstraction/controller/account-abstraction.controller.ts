import { Controller } from '@nestjs/common';
import type { AccountAbstractionService } from '../service/account-abstraction.service';

@Controller('account-abstraction')
export class AccountAbstractionController {
  constructor(private readonly service: AccountAbstractionService) {}
}
