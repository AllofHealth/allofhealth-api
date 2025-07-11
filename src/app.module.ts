import { ConfigifyModule } from '@itgorillaz/configify';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';
import config from '@/shared/config/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ContractModule } from './modules/contract/contract.module';
import { DoctorModule } from './modules/doctor/doctor.module';
import { HealthJournalModule } from './modules/health-journal/health-journal.module';
import { IdentityModule } from './modules/identity/identity.module';
import { MyLoggerModule } from './modules/my-logger/my-logger.module';
import { UserModule } from './modules/user/user.module';
import { DrizzleModule } from './shared/drizzle/drizzle.module';
import { AccountAbstractionModule } from './shared/modules/account-abstraction/account-abstraction.module';
import { ExternalAccountModule } from './shared/modules/external-account/external-account.module';
import { ApprovalModule } from './modules/approval/approval.module';
import { IpfsModule } from './modules/ipfs/ipfs.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
