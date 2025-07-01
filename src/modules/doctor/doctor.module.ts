import { forwardRef, Module } from '@nestjs/common';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { TokenModule } from '../token/token.module';
import { DoctorController } from './controller/doctor.controller';
import { DoctorProvider } from './provider/doctor.provider';
import { DoctorService } from './service/doctor.service';

@Module({
  imports: [forwardRef(() => TokenModule)],
  providers: [DoctorService, DoctorProvider, ErrorHandler],
  controllers: [DoctorController],
})
export class DoctorModule {}
