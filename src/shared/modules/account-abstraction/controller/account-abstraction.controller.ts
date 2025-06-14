import { Controller, Post, Query } from '@nestjs/common';
import { AccountAbstractionService } from '../service/account-abstraction.service';

@Controller('account-abstraction')
export class AccountAbstractionController {
  constructor(private readonly service: AccountAbstractionService) {}
  @Post('createAccount')
  async createAccount(@Query('userId') userId: string) {
    return await this.service.createSmartAccount({
      userId,
    });
  }
}
