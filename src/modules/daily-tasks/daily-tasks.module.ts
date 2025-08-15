import { forwardRef, Module } from '@nestjs/common';
import { DailyTasksController } from './controller/daily-tasks.controller';
import { DailyTasksService } from './service/daily-tasks.service';
import { DailyTasksProvider } from './provider/daily-tasks.provider';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { RewardModule } from '@/modules/reward/reward.module';
import { UserModule } from '@/modules/user/user.module';
import { AdminModule } from '@/modules/admin/admin.module';
import { TokenModule } from '../token/token.module';
import { DailyTasksTask } from './tasks/daily-tasks.task';

@Module({
  imports: [
    forwardRef(() => RewardModule),
    forwardRef(() => UserModule),
    forwardRef(() => AdminModule),
    forwardRef(() => TokenModule),
  ],
  controllers: [DailyTasksController],
  providers: [
    DailyTasksService,
    DailyTasksProvider,
    DailyTasksTask,
    ErrorHandler,
  ],
  exports: [DailyTasksService, DailyTasksProvider],
})
export class DailyTasksModule {}
