import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { ExternalAccountModule } from '@/shared/modules/external-account/external-account.module';
import { forwardRef, Module } from '@nestjs/common';
import { WalletController } from './controller/wallet.controller';
import { WalletProvider } from './provider/wallet.provider';
import { WalletService } from './service/wallet.service';
import { TokenModule } from '../token/token.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    ExternalAccountModule,
    forwardRef(() => TokenModule),
    forwardRef(() => UserModule),
  ],
  providers: [WalletProvider, WalletService, ErrorHandler],
  controllers: [WalletController],
})
export class WalletModule {}
