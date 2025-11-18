import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class TelemedicineTasks {
  private readonly logger = new MyLoggerService(TelemedicineTasks.name);
  constructor(@Inject(DRIZZLE_PROVIDER) private readonly _db: Database) {}
}
