import { Module } from '@nestjs/common';
import { WalletProvider } from './provider/wallet.provider';
import { WalletService } from './service/wallet.service';
import { WalletController } from './controller/wallet.controller';
import { ExternalAccountModule } from '@/shared/modules/external-account/external-account.module';

@Module({
  imports: [ExternalAccountModule],
  providers: [WalletProvider, WalletService],
  controllers: [WalletController]
})
export class WalletModule { }
