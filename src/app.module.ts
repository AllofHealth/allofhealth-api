import config from '@/shared/config/config';
import { ConfigifyModule } from '@itgorillaz/configify';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApprovalModule } from './modules/approval/approval.module';
import { AuthModule } from './modules/auth/auth.module';
import { ContractModule } from './modules/contract/contract.module';
import { DoctorModule } from './modules/doctor/doctor.module';
import { HealthJournalModule } from './modules/health-journal/health-journal.module';
import { IdentityModule } from './modules/identity/identity.module';
import { IpfsModule } from './modules/ipfs/ipfs.module';
import { MyLoggerModule } from './modules/my-logger/my-logger.module';
import { UserModule } from './modules/user/user.module';
import { DrizzleModule } from './shared/drizzle/drizzle.module';
import { AccountAbstractionModule } from './shared/modules/account-abstraction/account-abstraction.module';
import { ExternalAccountModule } from './shared/modules/external-account/external-account.module';
import { AdminModule } from './modules/admin/admin.module';
import { RecordsModule } from './modules/records/records.module';
import { OtpModule } from './modules/otp/otp.module';
import { AssetModule } from './modules/asset/asset.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { HealthInfoModule } from './modules/health-info/health-info.module';
import { RewardModule } from './modules/reward/reward.module';

@Module({
  imports: [
    ConfigifyModule.forRootAsync(),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('jwt.secret'),
        signOptions: {
          expiresIn: config.get('jwt.expiresIn'),
        },
      }),
      global: true,
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          username: configService.get('redis.username'),
          password: configService.get('redis.password'),
        },
      }),
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    IdentityModule,
    DoctorModule,
    UserModule,
    MyLoggerModule,
    DrizzleModule,
    AccountAbstractionModule,
    ExternalAccountModule,
    AuthModule,
    ContractModule,
    HealthJournalModule,
    ApprovalModule,
    IpfsModule,
    AdminModule,
    RecordsModule,
    OtpModule,
    AssetModule,
    WalletModule,
    HealthInfoModule,
    RewardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
