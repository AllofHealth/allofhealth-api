import { forwardRef, Module } from '@nestjs/common';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { TokenModule } from '../token/token.module';
import { DoctorController } from './controller/doctor.controller';
import { DoctorProvider } from './provider/doctor.provider';
import { DoctorService } from './service/doctor.service';
import { ConsultationModule } from '../consultation/consultation.module';
import { AvailabilityModule } from '../availability/availability.module';
import { AssetModule } from '../asset/asset.module';

@Module({
  imports: [
    forwardRef(() => TokenModule),
    forwardRef(() => ConsultationModule),
    forwardRef(() => AvailabilityModule),
    forwardRef(() => AssetModule),
  ],
  providers: [DoctorService, DoctorProvider, ErrorHandler],
  controllers: [DoctorController],
  exports: [DoctorService],
})
export class DoctorModule {}
