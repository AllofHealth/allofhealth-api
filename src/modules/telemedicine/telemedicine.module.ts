import { Module } from '@nestjs/common';
import { TelemedicineService } from './telemedicine.service';
import { TelemedicineController } from './telemedicine.controller';
import { Telemedicine } from './telemedicine';

@Module({
  providers: [TelemedicineService, Telemedicine],
  controllers: [TelemedicineController]
})
export class TelemedicineModule {}
