import { Global, Module } from '@nestjs/common';
import { MyLoggerService } from './service/my-logger.service';

@Global()
@Module({
  providers: [MyLoggerService],
  exports: [MyLoggerService],
})
export class MyLoggerModule {}
