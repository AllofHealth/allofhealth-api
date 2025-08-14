import { forwardRef, Module } from '@nestjs/common';
import { DailyTasksController } from './controller/daily-tasks.controller';
import { DailyTasksService } from './service/daily-tasks.service';
import { DailyTasksProvider } from './provider/daily-tasks.provider';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { RewardModule } from '@/modules/reward/reward.module';
import { UserModule } from '../user/user.module';
import { TokenModule } from '../token/token.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    RewardModule,
    forwardRef(() => UserModule),
    forwardRef(() => TokenModule),
    forwardRef(() => AdminModule),
  ],
  controllers: [DailyTasksController],
  providers: [DailyTasksService, DailyTasksProvider, ErrorHandler],
  exports: [DailyTasksService, DailyTasksProvider],
})
export class DailyTasksModule {}
