import { forwardRef, Module } from '@nestjs/common';
import { DoctorProvider } from './provider/doctor.provider';
import { DoctorService } from './service/doctor.service';
import { DoctorController } from './controller/doctor.controller';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [forwardRef(() => TokenModule)],
  providers: [DoctorService, DoctorProvider, ErrorHandler],
  controllers: [DoctorController],
})
export class DoctorModule {}
