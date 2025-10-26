import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                redis: {
                    host: configService.get('REDIS_HOST') || 'localhost',
                    port: configService.get('REDIS_PORT') || 6379,
                    password: configService.get('REDIS_PASSWORD'),
                    db: configService.get('REDIS_DB') || 0,
                },
                defaultJobOptions: {
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 2000,
                    },
                    removeOnComplete: true,
                    removeOnFail: false,
                },
            }),
            inject: [ConfigService],
        }),
        BullModule.registerQueue(
            {
                name: 'notifications',
                defaultJobOptions: {
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 1000,
                    },
                },
            },
            {
                name: 'reminders',
                defaultJobOptions: {
                    attempts: 5,
                    backoff: {
                        type: 'fixed',
                        delay: 60000, // 1 minute
                    },
                },
            },
        ),
    ],
    exports: [BullModule],
})
export class QueueModule { }