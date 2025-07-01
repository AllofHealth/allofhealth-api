import { Controller } from '@nestjs/common';
import { AccountAbstractionService } from '../service/account-abstraction.service';

@Controller('account-abstraction')
export class AccountAbstractionController {
  constructor(private readonly service: AccountAbstractionService) {}
}
