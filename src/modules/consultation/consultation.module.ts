import { forwardRef, Module } from '@nestjs/common';
import { ConsultationProvider } from './provider/consultation.provider';
import { ConsultationService } from './service/consultation.service';
import { ConsultationController } from './controller/consultation.controller';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { UserModule } from '../user/user.module';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [forwardRef(() => UserModule), forwardRef(() => TokenModule)],
  providers: [ConsultationService, ConsultationProvider, ErrorHandler],
  controllers: [ConsultationController],
  exports: [ConsultationService],
})
export class ConsultationModule {}
