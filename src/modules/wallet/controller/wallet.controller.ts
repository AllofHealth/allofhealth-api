import {
  Controller,
  Get,
  HttpStatus,
  Ip,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { WalletService } from '../service/wallet.service';
import {
  ContractErrorMessages,
  ContractSuccessMessages,
} from '@/modules/contract/data/contract.data';
import { WALLET_ERROR_MESSAGES } from '../data/wallet.data';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { OwnerGuard } from '@/modules/user/guard/user.guard';
import { USER_ERROR_MESSAGES } from '@/modules/user/data/user.data';
import { AccountAbstractionErrorMessage } from '@/shared/modules/account-abstraction/data/account-abstraction.data';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';

@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  private readonly logger = new MyLoggerService(WalletController.name);
  constructor(private readonly walletService: WalletService) {}

  @Get('tokenBalance')
  @UseGuards(AuthGuard, OwnerGuard)
  @ApiOperation({ summary: 'Fetch user token balance' })
  @ApiQuery({
    name: 'userId',
    type: String,
    required: true,
    description: 'User ID to fetch token balance for',
  })
  @ApiOkResponse({
    description: 'Returns token balance of user',
    example: {
      status: HttpStatus.OK,
      message: ContractSuccessMessages.TOKEN_BALANCE_FETCHED_SUCCESSFULLY,
      data: '0.01',
    },
  })
  @ApiBadRequestResponse({
    description: 'User not found',
    example: {
      status: HttpStatus.NOT_FOUND,
      message: USER_ERROR_MESSAGES.USER_NOT_FOUND,
    },
  })
  @ApiBadRequestResponse({
    description: 'Smart address not found',
    example: {
      status: HttpStatus.NOT_FOUND,
      message: AccountAbstractionErrorMessage.ERROR_SMART_ADDRESS_NOT_FOUND,
    },
  })
  @ApiInternalServerErrorResponse({
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: WALLET_ERROR_MESSAGES.ERROR_FETCHING_TOKEN_BALANCE,
    },
  })
  async fetchTokenBalance(@Ip() ip: string, @Query('userId') userId: string) {
    this.logger.log(`Token balance request from  ${ip} for ${userId}`);
    return this.walletService.fetchTokenBalance(userId);
  }
}
