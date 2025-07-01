import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as schema from '@/schemas/schema';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import {
  HealthJournalErrorMessages as HEM,
  HealthJournalSuccessMessages as HSM,
} from '../data/health-journal.data';
import { IAddEntry } from '../interface/health-journal.interface';

@Injectable()
export class HealthJournalProvider {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
    private readonly handler: ErrorHandler,
  ) {}

  async addJournalEntry(ctx: IAddEntry) {
    const { userId, mood, activities, symptoms, tags } = ctx;
    try {
      const journal = await this.db
        .insert(schema.health_journal)
        .values({
          userId,
          mood: mood.toLowerCase(),
          activities,
          symptoms,
          tags,
        })
        .returning();

      if (!journal || journal.length === 0) {
        return this.handler.handleReturn({
          status: HttpStatus.BAD_REQUEST,
          message: HEM.ERROR_ADDING_ENTRY,
        });
      }

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: HSM.SUCCESS_ADDING_ENTRY,
      });
    } catch (e) {
      return this.handler.handleError(e, HEM.ERROR_ADDING_ENTRY);
    }
  }
}
