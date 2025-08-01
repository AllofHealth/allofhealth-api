import { forwardRef, Module } from '@nestjs/common';
import { HealthJournalProvider } from './provider/health-journal.provider';
import { HealthJournalService } from './service/health-journal.service';
import { HealthJournalController } from './controller/health-journal.controller';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { TokenModule } from '../token/token.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [forwardRef(() => TokenModule), forwardRef(() => UserModule)],
  providers: [HealthJournalService, HealthJournalProvider, ErrorHandler],
  controllers: [HealthJournalController],
})
export class HealthJournalModule {}
